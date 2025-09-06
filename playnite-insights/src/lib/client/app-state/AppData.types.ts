import type { FullGame } from '@playnite-insights/lib/client/playnite-game';
import type { GetRecentSessionsResponse } from '@playnite-insights/lib/client/game-session';
import type { Company } from '@playnite-insights/lib/client/company';
import type { DashPageData } from '@playnite-insights/lib';

export type GamesSignal = { raw: FullGame[] | null };
export type CompanySignal = { raw: Company[] | null };
export type DashSignal = { pageData: DashPageData | null };
export type ServerTimeSignal = { utcNow: number | null; syncPoint: number | null };
export type RecentGameSessionSignal = { raw: GetRecentSessionsResponse | null; isLoading: boolean };
