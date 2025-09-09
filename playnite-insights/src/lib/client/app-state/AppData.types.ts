import type {
	GetAllCompaniesResponse,
	GetAllGamesResponse,
	GetAllGenresResponse,
	GetAllPlatformsResponse,
	GetPlayniteLibraryMetricsResponse,
	GetRecentSessionsResponse,
} from '@playnite-insights/lib/client';

export type GameSignal = { raw: GetAllGamesResponse | null; isLoading: boolean };
export type CompanySignal = { raw: GetAllCompaniesResponse | null; isLoading: boolean };
export type ServerTimeSignal = {
	utcNow: number | null;
	syncPoint: number | null;
	isLoading: boolean;
};
export type RecentGameSessionSignal = { raw: GetRecentSessionsResponse | null; isLoading: boolean };
export type LibraryMetricsSignal = {
	raw: GetPlayniteLibraryMetricsResponse | null;
	isLoading: boolean;
};
export type GenreSignal = { raw: GetAllGenresResponse | null; isLoading: boolean };
export type PlatformSignal = { raw: GetAllPlatformsResponse | null; isLoading: boolean };
export type IndexedDbSignal = { db: IDBDatabase | null };
