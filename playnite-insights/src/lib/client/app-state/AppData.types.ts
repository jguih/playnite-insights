import type {
	GetAllGenresResponse,
	GetAllPlatformsResponse,
	GetPlayniteLibraryMetricsResponse,
	GetRecentSessionsResponse,
	IFetchClient,
} from '@playnite-insights/lib/client';

export type HttpClientSignal = { client: IFetchClient | null };
export type ServerTimeSignal = {
	utcNow: number | null;
	syncPoint: number | null;
	isLoading: boolean;
};
export type RecentGameSessionSignal = {
	/**
	 * Constains all game sessions that overlaps the last 7 days
	 */
	raw: GetRecentSessionsResponse | null;
	isLoading: boolean;
};
export type LibraryMetricsSignal = {
	raw: GetPlayniteLibraryMetricsResponse | null;
	isLoading: boolean;
};
export type GenreSignal = { raw: GetAllGenresResponse | null; isLoading: boolean };
export type PlatformSignal = { raw: GetAllPlatformsResponse | null; isLoading: boolean };
export type IndexedDbSignal = { db: IDBDatabase | null; dbReady: Promise<void> | null };
