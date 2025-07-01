import type { PageServerLoad } from './$types';
import { getGameList } from '$lib/services/game-repository';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const params = url.searchParams;
	let changed = false;

	if (!params.has('page')) {
		params.set('page', '1');
		changed = true;
	}

	if (!params.has('page_size')) {
		params.set('page_size', '100');
		changed = true;
	}

	if (changed) {
		throw redirect(302, `${url.pathname}?${params.toString()}`);
	}

	const page = Number(url.searchParams.get('page') ?? '1');
	const page_size = Number(url.searchParams.get('page_size') ?? '100');
	const games = await getGameList();
	const start = (page - 1) * page_size;
	const end = start + page_size;
	const paginated = games.slice(start, end);
	const totalPages = Math.ceil(games.length / page_size);

	return { games: paginated, page, totalPages, totalGamesCount: games.length };
};
