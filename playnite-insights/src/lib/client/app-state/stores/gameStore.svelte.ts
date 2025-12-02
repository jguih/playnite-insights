import type {
	HomePageFilterParams,
	HomePagePaginationParams,
	HomePageSortingParams,
} from '$lib/client/page/home/searchParams.types';
import type { HomePageSearchParams } from '$lib/client/page/home/searchParams.utils';
import type { GameResponseDto } from '@playatlas/game-library/dtos';
import {
	FetchClientStrategyError,
	getAllGamesResponseSchema,
	JsonStrategy,
	type ApplicationSettings,
} from '@playnite-insights/lib/client';
import { ApiDataStore } from './apiDataStore.svelte';
import type { IApplicationSettingsStore } from './applicationSettingsStore.svelte';
import type { GameListSignal, GameStoreCacheItem, GameStoreDeps } from './gameStore.types';

export class GameStore extends ApiDataStore {
	#dataSignal: GameListSignal;
	#filteredCache: Map<string, GameResponseDto[]>;
	#sortedCache: Map<string, GameResponseDto[]>;
	#paginatedCache: Map<string, GameResponseDto[]>;
	#currentCacheItemSignal: GameStoreCacheItem | null;
	#applicationSettingsStore: IApplicationSettingsStore;
	#getHomePageSearchParams: () => HomePageSearchParams | null;

	constructor({ httpClient, applicationSettingsStore }: GameStoreDeps) {
		super({ httpClient });
		this.#applicationSettingsStore = applicationSettingsStore;
		this.#dataSignal = $state({
			raw: null,
			visibleOnly: null,
			isLoading: false,
			hasLoaded: false,
		});
		this.#filteredCache = new Map();
		this.#sortedCache = new Map();
		this.#paginatedCache = new Map();
		this.#getHomePageSearchParams = () => null;

		this.#currentCacheItemSignal = $derived.by(() => {
			const appSettings = this.#applicationSettingsStore.settingsSignal;
			const games = this.#dataSignal.raw;
			const homePageParams = this.#getHomePageSearchParams();
			return this.#buildCacheItem(games, homePageParams, appSettings);
		});
	}

	#buildCacheItem = (
		_games: GameResponseDto[] | null,
		homePageSearchParams: HomePageSearchParams | null,
		appSettings: ApplicationSettings,
	): GameStoreCacheItem => {
		if (!_games || !homePageSearchParams) {
			return {
				games: [],
				countFrom: 0,
				countTo: 0,
				total: 0,
				totalPages: 0,
			};
		}

		const games = [..._games];
		const filtered = this.#getFilteredGames(games, homePageSearchParams.filter, appSettings);
		const total = filtered.length;
		const sorted = this.#getSortedGames(
			filtered,
			homePageSearchParams.filter,
			homePageSearchParams.sorting,
		);
		const paginated = this.#getPaginatedGames(sorted, homePageSearchParams.pagination);

		const { page, pageSize } = homePageSearchParams.pagination;
		const countFrom = (page - 1) * pageSize;
		const countTo = Math.min(countFrom + pageSize, total);
		const totalPages = Math.ceil(total / pageSize);

		const cacheItem: GameStoreCacheItem = {
			games: paginated,
			countFrom,
			countTo,
			total,
			totalPages,
		};
		return cacheItem;
	};

	#applyFilters = (
		games: GameResponseDto[],
		args: HomePageFilterParams,
		appSettings: ApplicationSettings,
	): GameResponseDto[] => {
		let filtered = games;
		const query = args.query;
		const installed = args.installed;
		const notInstalled = args.notInstalled;
		const developers = args.developers;
		const publishers = args.publishers;
		const platforms = args.platforms;
		const genres = args.genres;
		const visibleOnly = appSettings.desconsiderHiddenGames;

		if (visibleOnly) {
			filtered = games.filter((g) => !g.Hidden);
		}
		if (query !== null) {
			filtered = games.filter((g) => g.Name?.toLowerCase().includes(query.toLowerCase()));
		}
		if (installed === true && notInstalled === false) {
			filtered = filtered.filter((g) => g.IsInstalled);
		}
		if (notInstalled === true && installed === false) {
			filtered = filtered.filter((g) => !g.IsInstalled);
		}
		if (developers.length > 0) {
			filtered = filtered.filter((g) => {
				for (const gameDevId of g.Developers) {
					if (developers.includes(gameDevId)) return true;
				}
				return false;
			});
		}
		if (publishers.length > 0) {
			filtered = filtered.filter((g) => {
				for (const gamePublisherId of g.Publishers) {
					if (publishers.includes(gamePublisherId)) return true;
				}
				return false;
			});
		}
		if (platforms.length > 0) {
			filtered = filtered.filter((g) => {
				for (const gamePlatformId of g.Platforms) {
					if (platforms.includes(gamePlatformId)) return true;
				}
				return false;
			});
		}
		if (genres.length > 0) {
			filtered = filtered.filter((g) => {
				for (const gameGenreId of g.Genres) {
					if (genres.includes(gameGenreId)) return true;
				}
				return false;
			});
		}
		return filtered;
	};

	#getFilteredGames = (
		games: GameResponseDto[],
		filterParams: HomePageFilterParams,
		appSettings: ApplicationSettings,
	) => {
		const key = JSON.stringify({ filterParams, appSettings });

		if (this.#filteredCache.has(key)) {
			return this.#filteredCache.get(key)!;
		}

		const result = this.#applyFilters(games, filterParams, appSettings);
		this.#filteredCache.set(key, result);
		return result;
	};

	#applySorting = (games: GameResponseDto[], args: HomePageSortingParams): GameResponseDto[] => {
		const gameList = [...games];
		const sortBy = args.sortBy;
		const sortOrder = args.sortOrder;
		const multiplier = sortOrder === 'asc' ? 1 : -1;

		const sorted = gameList.sort((a, b) => {
			let aValue = a[sortBy];
			let bValue = b[sortBy];

			if (sortBy === 'Added' || sortBy === 'LastActivity') {
				aValue = aValue ? new Date(aValue).getTime() : null;
				bValue = bValue ? new Date(bValue).getTime() : null;
			}

			const aIsNull = aValue === null || aValue === undefined;
			const bIsNull = bValue === null || bValue === undefined;

			if (aIsNull && bIsNull) return a.Id.localeCompare(b.Id);
			if (aIsNull) return -1 * multiplier;
			if (bIsNull) return 1 * multiplier;

			if (aValue! < bValue!) return -1 * multiplier;
			if (aValue! > bValue!) return 1 * multiplier;

			return 0;
		});

		return sorted;
	};

	#getSortedGames = (
		filtered: GameResponseDto[],
		filterParams: HomePageFilterParams,
		sortingParams: HomePageSortingParams,
	) => {
		const key = JSON.stringify({ filter: filterParams, sorting: sortingParams });

		if (this.#sortedCache.has(key)) {
			return this.#sortedCache.get(key)!;
		}

		const result = this.#applySorting(filtered, sortingParams);
		this.#sortedCache.set(key, result);
		return result;
	};

	#applyPagination = (
		games: GameResponseDto[],
		args: HomePagePaginationParams,
	): GameResponseDto[] => {
		const paginated = [...games];
		const pageSize = Number(args.pageSize);
		const offset = (Number(args.page) - 1) * Number(args.pageSize);
		const end = Math.min(offset + pageSize, games.length);
		return paginated.slice(offset, end);
	};

	#getPaginatedGames = (sorted: GameResponseDto[], paginationParams: HomePagePaginationParams) => {
		const key = JSON.stringify(paginationParams);

		if (this.#paginatedCache.has(key)) return this.#paginatedCache.get(key)!;

		const result = this.#applyPagination(sorted, paginationParams);
		this.#paginatedCache.set(key, result);
		return result;
	};

	loadGames = async () => {
		try {
			this.#dataSignal.isLoading = true;
			const result = await this.httpClient.httpGetAsync({
				endpoint: '/api/game',
				strategy: new JsonStrategy(getAllGamesResponseSchema),
			});
			this.#dataSignal.raw = result;
			return result;
		} catch (err) {
			if (err instanceof FetchClientStrategyError && err.statusCode === 204)
				this.#dataSignal.raw = [];
			return [];
		} finally {
			this.#dataSignal.isLoading = false;
			this.#dataSignal.hasLoaded = true;
		}
	};

	set getHomePageSearchParams(fn: () => HomePageSearchParams) {
		this.#getHomePageSearchParams = fn;
	}

	get gamesSignal(): GameStoreCacheItem | null {
		return this.#currentCacheItemSignal;
	}

	get isLoading() {
		return this.#dataSignal.isLoading;
	}

	get hasLoaded() {
		return this.#dataSignal.hasLoaded;
	}
}
