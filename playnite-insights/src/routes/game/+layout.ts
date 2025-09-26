import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
	const params = new URLSearchParams(url.searchParams);
	const gameId = params.get('id');
	return { gameId };
};
