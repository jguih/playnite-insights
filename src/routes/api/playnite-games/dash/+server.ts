import { getDashPagePlayniteGameList } from '$lib/services/playnite-game-repository';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
	const games = getDashPagePlayniteGameList();
	if (!games) {
		return json(null, { status: 404 });
	}
	return json(games);
};
