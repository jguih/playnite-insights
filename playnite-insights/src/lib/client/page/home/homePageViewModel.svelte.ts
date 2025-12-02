import type { ApplicationSettingsStore } from '$lib/client/app-state/stores/applicationSettingsStore.svelte';
import type { GameStore } from '$lib/client/app-state/stores/gameStore.svelte';
import type {
	GameStoreFiltersParams,
	GameStorePaginationParams,
	GameStoreSortingParams,
} from '$lib/client/app-state/stores/gameStore.types';
import { getPlayniteGameImageUrl } from '$lib/client/utils/playnite-game';
import { m } from '$lib/paraglide/messages';
import { gamePageSizes, type GameSortBy, type GameSortOrder } from '@playatlas/game-library/domain';
import type { GameResponseDto } from '@playatlas/game-library/dtos';
import type { ApplicationSettings } from '@playnite-insights/lib/client';
import type { HomePageFilterParams, HomePageGameCacheItem } from './searchParams.types';
import type { HomePageSearchParams } from './searchParams.utils';

export type HomePageViewModelDeps = {
	gameStore: GameStore;
	applicationSettingsStore: ApplicationSettingsStore;
	getPageParams: () => HomePageSearchParams;
};

export class HomePageViewModel {
	#gameStore: HomePageViewModelDeps['gameStore'];
	#filtersCount: number;
	#paginationSequenceSignal: (number | null)[];
	#filteredCache: Map<string, GameResponseDto[]>;
	#sortedCache: Map<string, GameResponseDto[]>;
	#paginatedCache: Map<string, GameResponseDto[]>;
	#currentCacheItemSignal: HomePageGameCacheItem;

	constructor({ gameStore, getPageParams, applicationSettingsStore }: HomePageViewModelDeps) {
		this.#gameStore = gameStore;
		this.#filteredCache = new Map();
		this.#sortedCache = new Map();
		this.#paginatedCache = new Map();

		this.#currentCacheItemSignal = $derived.by(() => {
			const games = gameStore.dataSignal.raw;
			const homePageParams = getPageParams();
			const appSettings = applicationSettingsStore.settingsSignal;
			return this.#buildCacheItem(games, homePageParams, appSettings);
		});

		this.#filtersCount = $derived.by(() => {
			let counter = 0;
			for (const filter of Object.values(getPageParams().filter)) {
				if (filter === null) continue;
				if (typeof filter === 'string' || typeof filter === 'number') {
					counter++;
					continue;
				}
				if (typeof filter === 'boolean') {
					if (filter === true) counter++;
					continue;
				}
				if (filter.length > 0) {
					counter++;
					continue;
				}
			}
			return counter;
		});

		this.#paginationSequenceSignal = $derived.by(() => {
			const pageParams = getPageParams();
			return this.getPaginationSequence(
				Number(pageParams.pagination.page),
				this.#currentCacheItemSignal.totalPages,
			);
		});
	}

	#getFilteredGames = (games: GameResponseDto[], filterParams: GameStoreFiltersParams) => {
		const key = JSON.stringify({ filterParams });

		if (this.#filteredCache.has(key)) {
			return this.#filteredCache.get(key)!;
		}

		const result = this.#gameStore.applyFilters(games, filterParams);
		this.#filteredCache.set(key, result);
		return result;
	};

	#getSortedGames = (
		filtered: GameResponseDto[],
		filterParams: GameStoreFiltersParams,
		sortingParams: GameStoreSortingParams,
	) => {
		const key = JSON.stringify({ filter: filterParams, sorting: sortingParams });

		if (this.#sortedCache.has(key)) {
			return this.#sortedCache.get(key)!;
		}

		const result = this.#gameStore.applySorting(filtered, sortingParams);
		this.#sortedCache.set(key, result);
		return result;
	};

	#getPaginatedGames = (sorted: GameResponseDto[], paginationParams: GameStorePaginationParams) => {
		const key = JSON.stringify(paginationParams);

		if (this.#paginatedCache.has(key)) return this.#paginatedCache.get(key)!;

		const result = this.#gameStore.applyPagination(sorted, paginationParams);
		this.#paginatedCache.set(key, result);
		return result;
	};

	#getGameStoreFilterParams = (
		homePageFilters: HomePageFilterParams,
		appSettings: ApplicationSettings,
	): GameStoreFiltersParams => {
		return {
			developerIds: homePageFilters.developers,
			genreIds: homePageFilters.genres,
			isInstalled: homePageFilters.installed,
			isNotInstalled: homePageFilters.notInstalled,
			platformIds: homePageFilters.platforms,
			publisherIds: homePageFilters.publishers,
			query: homePageFilters.query,
			visibleOnly: appSettings.desconsiderHiddenGames,
		};
	};

	#buildCacheItem = (
		_games: GameResponseDto[] | null,
		homePageSearchParams: HomePageSearchParams,
		appSettings: ApplicationSettings,
	): HomePageGameCacheItem => {
		if (!_games) {
			return {
				games: [],
				countFrom: 0,
				countTo: 0,
				total: 0,
				totalPages: 0,
			};
		}

		const games = [..._games];
		const { filter, pagination, sorting } = homePageSearchParams;
		const { page, pageSize } = pagination;

		const filterParams = this.#getGameStoreFilterParams(filter, appSettings);
		const filtered = this.#getFilteredGames(games, filterParams);
		const total = filtered.length;
		const sorted = this.#getSortedGames(filtered, filterParams, {
			sortBy: sorting.sortBy,
			sortOrder: sorting.sortOrder,
		});
		const paginated = this.#getPaginatedGames(sorted, {
			page,
			pageSize,
		});

		const countFrom = (page - 1) * pageSize;
		const countTo = Math.min(countFrom + pageSize, total);
		const totalPages = Math.ceil(total / pageSize);

		const cacheItem: HomePageGameCacheItem = {
			games: paginated,
			countFrom,
			countTo,
			total,
			totalPages,
		};
		return cacheItem;
	};

	getImageURL = (imagePath?: string | null): string => getPlayniteGameImageUrl(imagePath);

	getSortOrderLabel = (sortOrder: GameSortOrder): string => {
		switch (sortOrder) {
			case 'asc':
				return m.option_sort_ascending();
			case 'desc':
				return m.option_sort_descending();
		}
	};

	getSortByLabel = (sortBy: GameSortBy): string => {
		switch (sortBy) {
			case 'IsInstalled':
				return m.option_sortby_is_installed();
			case 'Added':
				return m.option_sortby_added();
			case 'LastActivity':
				return m.option_sortby_last_activity();
			case 'Playtime':
				return m.option_sortby_playtime();
			default:
				return sortBy;
		}
	};

	getPaginationSequence = (currentPage: number, totalPages: number) => {
		const delta = 1; // how many pages to show around current
		const range: (number | null)[] = [];

		for (let i = 1; i <= totalPages; i++) {
			if (
				i === 1 || // always first
				i === totalPages || // always last
				(i >= currentPage - delta && i <= currentPage + delta) // neighbors
			) {
				range.push(i);
			} else if (range.at(-1) !== null) {
				range.push(null); // ellipsis marker
			}
		}

		return range;
	};

	get gamesSignal(): HomePageGameCacheItem {
		return this.#currentCacheItemSignal;
	}

	get pageSizes() {
		return gamePageSizes;
	}

	get isLoading() {
		return !this.#gameStore.hasLoaded;
	}

	get filtersCount() {
		return this.#filtersCount;
	}

	get paginationSequenceSignal() {
		return this.#paginationSequenceSignal;
	}
}
