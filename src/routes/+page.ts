import type { GetHomePagePlayniteGamesResponse } from '$lib/services/playnite-game-repository';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch }) => {
	const searchParams = url.searchParams;
	const data = await fetch(`/api/playnite-games/home?${searchParams.toString()}`);
	const asJson = (await data.json()) as GetHomePagePlayniteGamesResponse;
	return { pageData: asJson };
};
