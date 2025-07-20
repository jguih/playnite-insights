import { platformSchema, type Platform } from '@playnite-insights/lib/client/platform';
import { companySchema, type Company } from '@playnite-insights/lib/client/company';
import { dashPageDataSchema, type DashPageData } from '@playnite-insights/lib/client/dash-page';
import { genreSchema, type Genre } from '@playnite-insights/lib/client/genre';
import { fullGameSchema, type FullGame } from '@playnite-insights/lib/client/playnite-game';
import { error } from '@sveltejs/kit';
import z from 'zod';

export const gameStore: { raw?: FullGame[] } = $state({});
export const companyStore: { raw?: Company[] } = $state({});
export const dashStore: { pageData?: DashPageData } = $state({});
export const genreStore: { raw?: Genre[] } = $state({});
export const platformStore: { raw?: Platform[] } = $state({});

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
