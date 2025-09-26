import { m } from '$lib/paraglide/messages';
import {
	gamePageSizes,
	type FullGame,
	type GameSortBy,
	type GameSortOrder,
} from '@playnite-insights/lib/client';
import type { PageProps } from '../../../routes/$types';
import type { GameStore } from '../app-state/stores/gameStore.svelte';
import { getPlayniteGameImageUrl } from '../utils/playnite-game';

export type HomePageViewModelProps = {
	getPageData: () => PageProps['data'];
	gameStore: GameStore;
};

export class HomePageViewModel {
	#getPageData: HomePageViewModelProps['getPageData'];
	#gameStore: HomePageViewModelProps['gameStore'];
	#games: FullGame[] | null;
	#gamesPaginated: FullGame[] | null;
	#gamesCountFrom: number;
	#gamesCountTo: number;
	#filtersCount: number;
	#totalPages: number;
	#pages: (number | null)[];

	constructor({ getPageData, gameStore }: HomePageViewModelProps) {
		this.#getPageData = getPageData;
		this.#gameStore = gameStore;

		this.#games = $derived.by(() => {
			const games = gameStore.gameList;
			let resolved = this.applyFilters(games);
			resolved = this.applySorting(resolved);
			return resolved;
		});
		this.#gamesPaginated = $derived.by(() => {
			const games = this.#games;
			const paginated = this.applyPagination(games);
			return paginated;
		});

		this.#gamesCountFrom = $derived.by(() => {
			const data = getPageData();
			return (Number(data.page) - 1) * Number(data.pageSize);
		});
		this.#gamesCountTo = $derived.by(() => {
			const data = getPageData();
			const gamesCount = this.#games ? this.#games.length : 0;
			return Math.min(Number(data.pageSize) + this.#gamesCountFrom, gamesCount);
		});
		this.#filtersCount = $derived.by(() => {
			let counter = 0;
			for (const filter of Object.values(this.filter)) {
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
		this.#totalPages = $derived.by(() => {
			const games = this.#games;
			const data = getPageData();
			return games ? Math.ceil(games.length / Number(data.pageSize)) : 0;
		});
		this.#pages = $derived.by(() => {
			const delta = 2; // how many pages to show around current
			const range: (number | null)[] = [];
			const data = getPageData();
			const current = Number(data.page);
			const total = this.#totalPages;

			for (let i = 1; i <= total; i++) {
				if (
					i === 1 || // always first
					i === total || // always last
					(i >= current - delta && i <= current + delta) // neighbors
				) {
					range.push(i);
				} else if (range.at(-1) !== null) {
					range.push(null); // ellipsis marker
				}
			}

			return range;
		});
	}

	private applyFilters = (games: FullGame[] | null): FullGame[] | null => {
		if (!games) return null;
		const data = this.#getPageData();
		let filtered = [...games];
		const query = data.query;
		const installed = data.installed;
		const notInstalled = data.notInstalled;
		const developers = data.developers;
		const publishers = data.publishers;
		const platforms = data.platforms;
		const genres = data.genres;
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

	private applySorting = (games: FullGame[] | null): FullGame[] | null => {
		if (!games) return null;
		const data = this.#getPageData();
		const gameList = [...games];
		const sortBy = data.sortBy;
		const sortOrder = data.sortOrder;
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

	private applyPagination = (games: FullGame[] | null): FullGame[] | null => {
		if (!games) return null;
		const data = this.#getPageData();
		const paginated = [...games];
		const pageSize = Number(data.pageSize);
		const offset = (Number(data.page) - 1) * Number(data.pageSize);
		const end = Math.min(offset + pageSize, games.length);
		return paginated.slice(offset, end);
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

	get pageSizes() {
		return gamePageSizes;
	}

	get games() {
		return this.#gamesPaginated;
	}

	get isLoading() {
		return this.#gameStore.isLoading || this.#games === null;
	}

	get pagination() {
		const data = this.#getPageData();
		return {
			pages: this.#pages,
			currentPage: Number(data.page),
			pageSize: data.pageSize,
			totalPages: this.#totalPages,
		};
	}

	get filter() {
		const data = this.#getPageData();
		return {
			installed: data.installed,
			notInstalled: data.notInstalled,
			query: data.query,
			developers: data.developers,
			publishers: data.publishers,
			platforms: data.platforms,
			genres: data.genres,
		};
	}

	get sort() {
		const data = this.#getPageData();
		return {
			by: data.sortBy,
			order: data.sortOrder,
		};
	}

	get totalGamesCount() {
		const games = this.#games;
		return games ? games.length : 0;
	}

	get gamesCountFrom() {
		return this.#gamesCountFrom;
	}

	get gamesCountTo() {
		return this.#gamesCountTo;
	}

	get filtersCount() {
		return this.#filtersCount;
	}
}
