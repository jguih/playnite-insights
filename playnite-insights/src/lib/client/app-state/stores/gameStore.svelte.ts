import { gameResponseDtoSchema, type GameResponseDto } from '@playatlas/game-library/dtos';
import { FetchClientStrategyError, JsonStrategy } from '@playnite-insights/lib/client';
import z from 'zod';
import { ApiDataStore } from './apiDataStore.svelte';
import type {
	GameStoreDataSignal,
	GameStoreDeps,
	GameStoreFiltersParams,
	GameStorePaginationParams,
	GameStoreSortingParams,
} from './gameStore.types';

export class GameStore extends ApiDataStore {
	#dataSignal: GameStoreDataSignal;

	constructor({ httpClient }: GameStoreDeps) {
		super({ httpClient });
		this.#dataSignal = $state({
			raw: null,
			visibleOnly: null,
			isLoading: false,
			hasLoaded: false,
		});
	}

	applyFilters = (
		games: GameResponseDto[],
		params: GameStoreFiltersParams = {},
	): GameResponseDto[] => {
		let filtered = games;
		const {
			query,
			developerIds: developers,
			genreIds: genres,
			platformIds: platforms,
			publisherIds: publishers,
			isInstalled: installed,
			isNotInstalled: notInstalled,
			visibleOnly,
		} = params;

		if (visibleOnly) {
			filtered = games.filter((g) => !g.Hidden);
		}
		if (query) {
			filtered = games.filter((g) => g.Name?.toLowerCase().includes(query.toLowerCase()));
		}
		if (installed === true && notInstalled === false) {
			filtered = filtered.filter((g) => g.IsInstalled);
		}
		if (notInstalled === true && installed === false) {
			filtered = filtered.filter((g) => !g.IsInstalled);
		}
		if (developers && developers.length > 0) {
			filtered = filtered.filter((g) => {
				for (const gameDevId of g.Developers) {
					if (developers.includes(gameDevId)) return true;
				}
				return false;
			});
		}
		if (publishers && publishers.length > 0) {
			filtered = filtered.filter((g) => {
				for (const gamePublisherId of g.Publishers) {
					if (publishers.includes(gamePublisherId)) return true;
				}
				return false;
			});
		}
		if (platforms && platforms.length > 0) {
			filtered = filtered.filter((g) => {
				for (const gamePlatformId of g.Platforms) {
					if (platforms.includes(gamePlatformId)) return true;
				}
				return false;
			});
		}
		if (genres && genres.length > 0) {
			filtered = filtered.filter((g) => {
				for (const gameGenreId of g.Genres) {
					if (genres.includes(gameGenreId)) return true;
				}
				return false;
			});
		}
		return filtered;
	};

	applySorting = (
		filtered: GameResponseDto[],
		params: GameStoreSortingParams = {},
	): GameResponseDto[] => {
		const { sortBy, sortOrder } = params;
		if (!sortBy || !sortOrder) return filtered;

		const multiplier = sortOrder === 'asc' ? 1 : -1;

		const sorted = filtered.sort((a, b) => {
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

	applyPagination = (
		sorted: GameResponseDto[],
		params: GameStorePaginationParams,
	): GameResponseDto[] => {
		const pageSize = Number(params.pageSize);
		const offset = (Number(params.page) - 1) * Number(params.pageSize);
		const end = Math.min(offset + pageSize, sorted.length);
		return sorted.slice(offset, end);
	};

	loadGames = async () => {
		const responseSchema = z.array(gameResponseDtoSchema);
		try {
			this.#dataSignal.isLoading = true;
			const result = await this.httpClient.httpGetAsync({
				endpoint: '/api/game',
				strategy: new JsonStrategy(responseSchema),
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

	get dataSignal() {
		return this.#dataSignal;
	}

	get isLoading() {
		return this.#dataSignal.isLoading;
	}

	get hasLoaded() {
		return this.#dataSignal.hasLoaded;
	}
}
