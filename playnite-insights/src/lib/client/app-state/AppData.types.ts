import type {
	Company,
	DashPageData,
	FullGame,
	GetRecentSessionsResponse,
} from '@playnite-insights/lib/client';

export type GameSignal = { raw: FullGame[] | null };
export type CompanySignal = { raw: Company[] | null };
export type DashSignal = { pageData: DashPageData | null };
export type ServerTimeSignal = { utcNow: number | null; syncPoint: number | null };
export type RecentGameSessionSignal = { raw: GetRecentSessionsResponse | null; isLoading: boolean };
