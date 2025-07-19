import { dashPageDataSchema, type DashPageData } from '@playnite-insights/lib';
import { developerSchema, type Developer } from '@playnite-insights/lib/client/developer';
import { fullGameSchema, type FullGame } from '@playnite-insights/lib/client/playnite-game';
import { error } from '@sveltejs/kit';
import z from 'zod';

export const gameStore: { raw?: FullGame[] } = $state({});
export const devStore: { raw?: Developer[] } = $state({});
export const dashStore: { pageData?: DashPageData } = $state({});

export const loadDevs = async () => {
	const origin = window.location.origin;
	const url = `${origin}/api/developer`;
	try {
		const response = await fetch(url);
		const asJson = await response.json();
		const devs = z.optional(z.array(developerSchema)).parse(asJson);
		devStore.raw = devs;
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
		gameStore.raw = games;
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
