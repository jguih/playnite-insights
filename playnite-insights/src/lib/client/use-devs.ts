import { developerSchema, type Developer } from '@playnite-insights/lib/client/developer';
import z from 'zod';

export const fetchDevs = async (): Promise<Developer[] | undefined> => {
	const origin = window.location.origin;
	const url = `${origin}/api/developer`;
	const response = await fetch(url);
	const asJson = await response.json();
	const devs = z.optional(z.array(developerSchema)).parse(asJson);
	return devs;
};
