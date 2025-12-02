import type { GamePageSize } from '@playatlas/game-library/domain';
import type { GameResponseDto } from '@playatlas/game-library/dtos';
import type { GameSortBy, GameSortOrder } from '@playnite-insights/lib/client';
import type { ApiDataStoreDeps } from './apiDataStore.svelte';

export type GameStoreDeps = ApiDataStoreDeps & {};

export type GameStoreDataSignal = {
	raw: GameResponseDto[] | null;
	isLoading: boolean;
	hasLoaded: boolean;
};

export type GameStoreCacheItem = {
	games: GameResponseDto[];
	total: number;
	countFrom: number;
	countTo: number;
	totalPages: number;
};

export type GameStoreFiltersParams = Partial<{
	query: string | null;
	isInstalled: boolean;
	isNotInstalled: boolean;
	developerIds: string[];
	publisherIds: string[];
	genreIds: string[];
	platformIds: string[];
	visibleOnly: boolean;
}>;

export type GameStoreSortingParams = Partial<{
	sortBy: GameSortBy;
	sortOrder: GameSortOrder;
}>;

export type GameStorePaginationParams = {
	pageSize: GamePageSize;
	page: number;
};
