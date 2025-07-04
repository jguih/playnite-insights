import { getPlayniteGameById } from '$lib/playnite-game/playnite-game-repository';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ params }) => {
	const { id } = params;
	if (!id) {
		return json({ message: 'id required' }, { status: 400 });
	}
	const game = getPlayniteGameById(id);
	if (!game) {
		return json(null, { status: 404 });
	}
	return json(game);
};
