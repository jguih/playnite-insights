import { repositories } from '$lib';
import { schemas } from '$lib/services/playnite-game/schemas';
import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';

export const GET: RequestHandler = () => {
	const totalPlaytimeOverLast6Months =
		repositories.playniteLibrarySync.getTotalPlaytimeOverLast6Months() ?? [];
	const totalGamesOwnedOverLast6Months =
		repositories.playniteLibrarySync.getTotalGamesOwnedOverLast6Months() ?? [];
	const top10MostPlayedGames = repositories.playniteGame.getTopMostPlayedGames(10) ?? [];
	const responseData: z.infer<typeof schemas.statisticsResponse> = {
		totalPlaytimeOverLast6Months,
		totalGamesOwnedOverLast6Months,
		top10MostPlayedGames
	};
	return json(responseData);
};
