import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { GetPlayniteGameByIdResult } from '$lib/services/playnite-game-repository';

export const load: PageLoad = async ({ params, fetch }) => {
	const { playniteGameId } = params;
	if (!playniteGameId) {
		return error(400);
	}
	const response = await fetch(`/api/playnite-games/${playniteGameId}`).catch(() => {
		return undefined;
	});
	if (!response) {
		return response;
	}
	const game = (await response.json()) as GetPlayniteGameByIdResult;
	return { game };
};
