import { getTopMostPlayedGames } from '$lib/playnite-game/playnite-game-repository';
import type { statisticsResponseSchema } from '$lib/playnite-game/schemas';
import {
	getTotalGamesOwnedOverLast6Months,
	getTotalPlaytimeOverLast6Months
} from '$lib/playnite-library-sync/playnite-library-sync-repository';
import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';

export const GET: RequestHandler = () => {
	const totalPlaytimeOverLast6Months = getTotalPlaytimeOverLast6Months() ?? [];
	const totalGamesOwnedOverLast6Months = getTotalGamesOwnedOverLast6Months() ?? [];
	const top10MostPlayedGames = getTopMostPlayedGames(10) ?? [];
	const responseData: z.infer<typeof statisticsResponseSchema> = {
		totalPlaytimeOverLast6Months,
		totalGamesOwnedOverLast6Months,
		top10MostPlayedGames
	};
	return json(responseData);
};
