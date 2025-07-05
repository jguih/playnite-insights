import {
	getPlayniteGameById,
	getPlayniteGameDevelopers
} from '$lib/playnite-game/playnite-game-repository';
import { gameByIdSchema } from '$lib/playnite-game/schemas';
import { json, type RequestHandler } from '@sveltejs/kit';
import type z from 'zod';

export const GET: RequestHandler = ({ params }) => {
	const { id } = params;
	if (!id) {
		return json({ message: 'id required' }, { status: 400 });
	}
	const game = getPlayniteGameById(id);
	if (!game) {
		return json(null, { status: 404 });
	}
	const resonseData: z.infer<typeof gameByIdSchema> = {
		game,
		developers: game && getPlayniteGameDevelopers({ Id: game.Id, Name: game.Name })
	};
	return json(resonseData);
};
