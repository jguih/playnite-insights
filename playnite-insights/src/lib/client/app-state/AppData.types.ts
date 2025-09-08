import type {
	Company,
	FullGame,
	GetRecentSessionsResponse,
	PlayniteLibraryMetrics,
} from '@playnite-insights/lib/client';

export type GameSignal = { raw: FullGame[] | null };
export type CompanySignal = { raw: Company[] | null };
export type ServerTimeSignal = { utcNow: number | null; syncPoint: number | null };
export type RecentGameSessionSignal = { raw: GetRecentSessionsResponse | null; isLoading: boolean };
export type LibraryMetricsSignal = { raw: PlayniteLibraryMetrics | null; isLoading: boolean };
