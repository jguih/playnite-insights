import { json, type RequestHandler } from '@sveltejs/kit';
import type z from 'zod';
import { repositories } from '$lib';
import { schemas } from '$lib/services/playnite-game/schemas';

export const GET: RequestHandler = ({ params }) => {
	const { id } = params;
	if (!id) {
		return json({ message: 'id required' }, { status: 400 });
	}
	const game = repositories.playniteGame.getById(id);
	if (!game) {
		return json(null, { status: 404 });
	}
	const resonseData: z.infer<typeof schemas.gameById> = {
		game,
		developers: game && repositories.playniteGame.getDevelopers({ Id: game.Id, Name: game.Name })
	};
	return json(resonseData);
};
