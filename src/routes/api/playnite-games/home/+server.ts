import { getHomePagePlayniteGameList } from '$lib/playnite-game/playnite-game-repository';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ url }) => {
	const searchParams = url.searchParams;

	const page = Number(searchParams.get('page'));
	if (!Number.isInteger(page)) {
		return json({ message: 'page must be an integer' }, { status: 400 });
	}

	const pageSize = Number(searchParams.get('page_size'));
	if (!Number.isInteger(pageSize)) {
		return json({ message: 'page_size must an integer' }, { status: 400 });
	}

	const offset = (Number(page) - 1) * Number(pageSize);

	const games = getHomePagePlayniteGameList(offset, pageSize);
	return json({ ...games });
};
