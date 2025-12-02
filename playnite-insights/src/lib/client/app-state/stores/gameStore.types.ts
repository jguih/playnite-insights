import type { GameResponseDto } from '@playatlas/game-library/dtos';
import type { ApiDataStoreDeps } from './apiDataStore.svelte';
import type { IApplicationSettingsStore } from './applicationSettingsStore.svelte';

export type GameStoreDeps = ApiDataStoreDeps & {
	applicationSettingsStore: IApplicationSettingsStore;
};

export type GameListSignal = {
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
