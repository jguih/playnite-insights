<script
	lang="ts"
	module
>
	import { platformSchema, type Platform } from '@playnite-insights/lib/client/platform';
	import { companySchema } from '@playnite-insights/lib/client/company';
	import { dashPageDataSchema } from '@playnite-insights/lib/client/dash-page';
	import { genreSchema, type Genre } from '@playnite-insights/lib/client/genre';
	import { fullGameSchema } from '@playnite-insights/lib/client/playnite-game';
	import { getRecentSessionsResponseSchema } from '@playnite-insights/lib/client/game-session';
	import { error } from '@sveltejs/kit';
	import z from 'zod';
	import { getServerTimeResponseSchema } from '@playnite-insights/lib/client/time';
	import type {
		CompanySignal,
		DashSignal,
		GamesSignal,
		RecentGameSessionSignal,
		ServerTimeSignal,
	} from './AppData.types';

	export const companySignal = $state<CompanySignal>({ raw: null });
	export const dashSignal = $state<DashSignal>({ pageData: null });
	export const gameSignal = $state<GamesSignal>({ raw: null });
	export const recentGameSessionSignal = $state<RecentGameSessionSignal>({
		raw: null,
		isLoading: false,
	});
	export const genreSignal: { raw?: Genre[] } = $state({});
	export const platformSignal: { raw?: Platform[] } = $state({});
	export const serverTimeSignal = $state<ServerTimeSignal>({ syncPoint: null, utcNow: null });

	export const loadCompanies = async () => {
		const origin = window.location.origin;
		const url = `${origin}/api/company`;
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error('Failed to fetch companies');
			}
			const asJson = await response.json();
			const companies = z.optional(z.array(companySchema)).parse(asJson);
			if (companies) companySignal.raw = companies;
		} catch (err) {
			error(500, `Failed to fetch developers: ${(err as Error).message}`);
		}
	};

	export const loadGames = async () => {
		const origin = window.location.origin;
		const url = `${origin}/api/game`;
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error('Failed to fetch games');
			}
			const asJson = await response.json();
			const games = z.optional(z.array(fullGameSchema)).parse(asJson);
			if (games) gameSignal.raw = games;
		} catch (err) {
			error(500, `Failed to fetch games: ${(err as Error).message}`);
		}
	};

	export const loadDashData = async () => {
		const origin = window.location.origin;
		const url = `${origin}/api/dash`;
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error('Failed to fetch dash data');
			}
			const asJson = await response.json();
			const data = z.optional(dashPageDataSchema).parse(asJson);
			if (data) dashSignal.pageData = data;
		} catch (err) {
			error(500, `Failed to fetch dashboard page data: ${(err as Error).message}`);
		}
	};

	export const loadRecentGameSessions = async () => {
		const origin = window.location.origin;
		const url = `${origin}/api/session/recent`;
		try {
			recentGameSessionSignal.isLoading = true;
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error('Failed to fetch recent activity');
			}
			const asJson = await response.json();
			const data = z.optional(getRecentSessionsResponseSchema).parse(asJson);
			if (data) {
				recentGameSessionSignal.raw = data;
			}
		} catch (err) {
			console.error(err);
		} finally {
			recentGameSessionSignal.isLoading = false;
		}
	};

	export const loadServerTime = async () => {
		const origin = window.location.origin;
		const url = `${origin}/api/time/now`;
		try {
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
		}
	};

	export const loadGenres = async () => {
		const origin = window.location.origin;
		const url = `${origin}/api/genre`;
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error('Failed to fetch genres');
			}
			const asJson = await response.json();
			const genres = z.optional(z.array(genreSchema)).parse(asJson);
			if (genres) genreSignal.raw = genres;
		} catch (err) {
			error(500, `Failed to fetch genres: ${(err as Error).message}`);
		}
	};

	export const loadPlatforms = async () => {
		const origin = window.location.origin;
		const url = `${origin}/api/platform`;
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error('Failed to fetch platforms');
			}
			const asJson = await response.json();
			const platforms = z.optional(z.array(platformSchema)).parse(asJson);
			if (platforms) platformSignal.raw = platforms;
		} catch (err) {
			error(500, `Failed to fetch platforms: ${(err as Error).message}`);
		}
	};
</script>
