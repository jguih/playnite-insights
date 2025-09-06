<script
	lang="ts"
	module
>
	/**
	 * DO NOT use $derived.by in this file, in fact do not use it outside a component, ever.
	 * It'll 100% break shit.
	 */
	import { platformSchema, type Platform } from '@playnite-insights/lib/client/platform';
	import { companySchema, type Company } from '@playnite-insights/lib/client/company';
	import { dashPageDataSchema, type DashPageData } from '@playnite-insights/lib/client/dash-page';
	import { genreSchema, type Genre } from '@playnite-insights/lib/client/genre';
	import { fullGameSchema, type FullGame } from '@playnite-insights/lib/client/playnite-game';
	import {
		getRecentSessionsResponseSchema,
		type GameActivity,
		type GameSession,
		type GetRecentSessionsResponse,
	} from '@playnite-insights/lib/client/game-session';
	import { error } from '@sveltejs/kit';
	import z from 'zod';
	import { getServerTimeResponseSchema } from '@playnite-insights/lib/client/time';

	type RecentActivitySignal = {
		raw: GetRecentSessionsResponse | null;
		isLoading: boolean;
		recentActivityMap: Map<string, GameActivity> | null;
		inProgressActivity: GameActivity | null;
	};

	export const companyStore = $state<{ raw?: Company[] }>({});
	export const dashStore = $state<{ pageData?: DashPageData }>({});
	export const gamesSignal = $state<{ raw?: FullGame[] }>({});
	export const recentActivitySignal = $state<RecentActivitySignal>({
		isLoading: false,
		raw: null,
		recentActivityMap: null,
		inProgressActivity: null,
	});
	export const genreStore: { raw?: Genre[] } = $state({});
	export const platformStore: { raw?: Platform[] } = $state({});
	export const serverTimeSignal: { utcNow?: number; syncPoint?: number } = $state({});

	export const loadCompanies = async () => {
		const origin = window.location.origin;
		const url = `${origin}/api/company`;
		try {
			const response = await fetch(url);
			const asJson = await response.json();
			const companies = z.optional(z.array(companySchema)).parse(asJson);
			companyStore.raw = companies;
		} catch (err) {
			error(500, `Failed to fetch developers: ${(err as Error).message}`);
		}
	};

	export const loadGames = async () => {
		const origin = window.location.origin;
		const url = `${origin}/api/game`;
		try {
			const response = await fetch(url);
			const asJson = await response.json();
			const games = z.optional(z.array(fullGameSchema)).parse(asJson);
			gamesSignal.raw = games;
		} catch (err) {
			error(500, `Failed to fetch games: ${(err as Error).message}`);
		}
	};

	export const loadDashData = async () => {
		const origin = window.location.origin;
		const url = `${origin}/api/dash`;
		try {
			const response = await fetch(url);
			const asJson = await response.json();
			const data = dashPageDataSchema.parse(asJson);
			dashStore.pageData = data;
		} catch (err) {
			error(500, `Failed to fetch dashboard page data: ${(err as Error).message}`);
		}
	};

	export const loadRecentActivity = async () => {
		const origin = window.location.origin;
		const url = `${origin}/api/session/recent`;
		try {
			recentActivitySignal.isLoading = true;
			const response = await fetch(url);
			const asJson = await response.json();
			const data = z.optional(getRecentSessionsResponseSchema).parse(asJson);
			if (data) {
				const activitiesMap = toGameActivityMap(data);
				let inProgressActivity = null;
				for (const [, activity] of activitiesMap) {
					if (activity.status === 'in_progress') {
						inProgressActivity = activity;
						break;
					}
				}
				recentActivitySignal.raw = data;
				recentActivitySignal.recentActivityMap = activitiesMap;
				recentActivitySignal.inProgressActivity = inProgressActivity;
			}
		} catch (err) {
			console.error(err);
		} finally {
			recentActivitySignal.isLoading = false;
		}
	};

	export const loadServerTime = async () => {
		const origin = window.location.origin;
		const url = `${origin}/api/time/now`;
		try {
			recentActivitySignal.isLoading = true;
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error('Failed to fetch server time');
			}
			const asJson = await response.json();
			const data = getServerTimeResponseSchema.parse(asJson);
			serverTimeSignal.utcNow = new Date(data.utcNow).getTime();
			serverTimeSignal.syncPoint = performance.now();
		} catch (err) {
			console.error(err);
		} finally {
			recentActivitySignal.isLoading = false;
		}
	};

	/**
	 * Get server-accurate UTC Now
	 * @returns Number of milliseconds elapsed since midnight, January 1, 1970 Universal Coordinated Time (UTC).
	 */
	export const getUtcNow = (): number => {
		if (!serverTimeSignal.syncPoint || !serverTimeSignal.utcNow) return Date.now();
		const elapsed = performance.now() - serverTimeSignal.syncPoint;
		return serverTimeSignal.utcNow + elapsed;
	};

	export const loadGenres = async () => {
		const origin = window.location.origin;
		const url = `${origin}/api/genre`;
		try {
			const response = await fetch(url);
			const asJson = await response.json();
			const genres = z.optional(z.array(genreSchema)).parse(asJson);
			genreStore.raw = genres;
		} catch (err) {
			error(500, `Failed to fetch genres: ${(err as Error).message}`);
		}
	};

	export const loadPlatforms = async () => {
		const origin = window.location.origin;
		const url = `${origin}/api/platform`;
		try {
			const response = await fetch(url);
			const asJson = await response.json();
			const platforms = z.optional(z.array(platformSchema)).parse(asJson);
			platformStore.raw = platforms;
		} catch (err) {
			error(500, `Failed to fetch platforms: ${(err as Error).message}`);
		}
	};

	const toGameActivityMap = (response: GetRecentSessionsResponse) => {
		const data: Map<string, GameActivity> = new Map();
		const sessions = response ?? [];

		for (const session of sessions) {
			const key = session.GameId ? session.GameId : session.GameName;
			if (key === null) continue;

			const currentStatus = getActivityStateFromSession(session);
			const duration = session.Duration ?? 0;

			if (!data.has(key)) {
				data.set(key, {
					gameName: session.GameName ?? '',
					gameId: session.GameId ?? '',
					status: currentStatus,
					totalPlaytime: duration,
					sessions: [session],
				});
				continue;
			}

			const value = data.get(key)!;
			value.totalPlaytime += duration;
			value.sessions.push(session);
			if (value.status !== 'in_progress') {
				value.status = currentStatus;
			}
		}
		return data;
	};

	const getActivityStateFromSession = (session: GameSession): 'in_progress' | 'not_playing' => {
		if (session.Status === 'in_progress') return 'in_progress';
		return 'not_playing';
	};
</script>
