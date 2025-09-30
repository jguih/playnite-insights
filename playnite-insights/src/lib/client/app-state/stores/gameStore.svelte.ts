import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
	getAllGamesResponseSchema,
	JsonStrategy,
	parseHomePageSearchParams,
	type FullGame,
	type GetAllGamesResponse,
	type HomePageFilterParams,
	type HomePagePaginationParams,
	type HomePageSortingParams,
} from '@playnite-insights/lib/client';
import { ApiDataStore, type ApiDataStoreDeps } from './apiDataStore.svelte';

export type GameStoreDeps = ApiDataStoreDeps;

export type GameListSignal = {
	list: GetAllGamesResponse | null;
	isLoading: boolean;
	hasLoaded: boolean;
};

export type GameStoreCacheItem = {
	games: FullGame[];
	total: number;
	countFrom: number;
	countTo: number;
	totalPages: number;
};

export class GameStore extends ApiDataStore {
	#dataSignal: GameListSignal;
	#cache: Map<string, GameStoreCacheItem>;

	constructor({ httpClient }: GameStoreDeps) {
		super({ httpClient });
		this.#dataSignal = $state({ list: null, isLoading: false, hasLoaded: false });
		this.#cache = new Map();
	}

	#makeCacheKey = (searchParams: URLSearchParams): string => {
		return JSON.stringify(Object.fromEntries(searchParams.entries()));
	};

	#applyFilters = (games: FullGame[], args: HomePageFilterParams): FullGame[] => {
		let filtered = [...games];
		const query = args.query;
		const installed = args.installed;
		const notInstalled = args.notInstalled;
		const developers = args.developers;
		const publishers = args.publishers;
		const platforms = args.platforms;
		const genres = args.genres;
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

	#applySorting = (games: FullGame[], args: HomePageSortingParams): FullGame[] => {
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

	#applyPagination = (games: FullGame[], args: HomePagePaginationParams): FullGame[] => {
		const paginated = [...games];
		const pageSize = Number(args.pageSize);
		const offset = (Number(args.page) - 1) * Number(args.pageSize);
		const end = Math.min(offset + pageSize, games.length);
		return paginated.slice(offset, end);
	};

	loadGames = async () => {
		try {
			return await this.withHttpClient(async ({ client }) => {
				this.#dataSignal.isLoading = true;
				const result = await client.httpGetAsync({
					endpoint: '/api/game',
					strategy: new JsonStrategy(getAllGamesResponseSchema),
				});
				this.#dataSignal.list = result;
				return result;
			});
		} catch (err) {
			handleClientErrors(err, `[loadGames] failed to fetch /api/game`);
			return null;
		} finally {
			this.#dataSignal.isLoading = false;
			this.#dataSignal.hasLoaded = true;
			this.#cache = new Map();
		}
	};

	get gameList() {
		return this.#dataSignal.list;
	}

	get isLoading() {
		return this.#dataSignal.isLoading;
	}

	get hasLoaded() {
		return this.#dataSignal.hasLoaded;
	}

	getfilteredGames = (searchParams: URLSearchParams): GameStoreCacheItem => {
		const key = this.#makeCacheKey(searchParams);

		if (this.#cache.has(key)) {
			return this.#cache.get(key)!;
		}

		const games = this.#dataSignal.list ? [...this.#dataSignal.list] : null;
		if (games === null) {
			return {
				games: [],
				countFrom: 0,
				countTo: 0,
				total: 0,
				totalPages: 0,
			};
		}

		const args = parseHomePageSearchParams(searchParams);
		let filtered = this.#applyFilters(games, args.filter);
		const total = filtered.length;
		const countFrom = (Number(args.pagination.page) - 1) * Number(args.pagination.pageSize);
		const countTo = Math.min(Number(args.pagination.pageSize) + countFrom, total);
		const totalPages = Math.ceil(total / Number(args.pagination.pageSize));
		filtered = this.#applySorting(filtered, args.sorting);
		filtered = this.#applyPagination(filtered, args.pagination);
		const cacheItem = {
			games: filtered,
			countFrom,
			countTo,
			total,
			totalPages,
		};
		this.#cache.set(key, cacheItem);
		return cacheItem;
	};
}
