<script
	lang="ts"
	module
>
	import {
		companySchema,
		fullGameSchema,
		genreSchema,
		getRecentSessionsResponseSchema,
		getServerTimeResponseSchema,
		platformSchema,
		playniteLibraryMetricsSchema,
		type Genre,
		type Platform,
	} from '@playnite-insights/lib/client';
	import { error } from '@sveltejs/kit';
	import z from 'zod';
	import type {
		CompanySignal,
		GameSignal,
		LibraryMetricsSignal,
		RecentGameSessionSignal,
		ServerTimeSignal,
	} from './AppData.types';

	export const companySignal = $state<CompanySignal>({ raw: null });
	export const gameSignal = $state<GameSignal>({ raw: null });
	export const recentGameSessionSignal = $state<RecentGameSessionSignal>({
		raw: null,
		isLoading: false,
	});
	export const genreSignal: { raw?: Genre[] } = $state({});
	export const platformSignal: { raw?: Platform[] } = $state({});
	export const serverTimeSignal = $state<ServerTimeSignal>({ syncPoint: null, utcNow: null });
	export const libraryMetricsSignal = $state<LibraryMetricsSignal>({ raw: null, isLoading: false });

	export const loadLibraryMetrics = async () => {
		const origin = window.location.origin;
		const url = `${origin}/api/library/metrics`;
		try {
			libraryMetricsSignal.isLoading = true;
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error('Failed to fetch library metrics');
			}
			const asJson = await response.json();
			const metrics = z.optional(playniteLibraryMetricsSchema).parse(asJson);
			if (metrics) libraryMetricsSignal.raw = metrics;
		} catch (err) {
			error(500, `${(err as Error).message}`);
		} finally {
			libraryMetricsSignal.isLoading = false;
		}
	};

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
