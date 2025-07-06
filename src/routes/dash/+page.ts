import { getLastSixMonthsInclusiveAbreviated } from '$lib/utils/date';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { schemas } from '$lib/services/playnite-game/schemas';
import type z from 'zod';

const getTotalPlaytime = (games: z.infer<typeof schemas.dashPagePlayniteGameList>) => {
	if (games.length === 0) {
		return 0;
	}
	return (games.map((g) => g.Playtime).reduce((prev, acc) => prev + acc) / 3600).toFixed(1);
};

export const load: PageLoad = async ({ fetch }) => {
	try {
		const gamesResponse = await fetch(`/api/playnite-games/dash`);
		const games = schemas.dashPagePlayniteGameList.parse(await gamesResponse.json());
		const statisticsResponse = await fetch(`/api/playnite-games/dash/statistics`);
		const statistics = schemas.statisticsResponse.safeParse(await statisticsResponse.json());

		const total = games.length;
		const installed = games.length > 0 ? games.filter((g) => Boolean(g.IsInstalled)).length : 0;
		const notInstalled = games.length - installed;
		const totalPlayTime = getTotalPlaytime(games);
		const notPlayed = games.length > 0 ? games.filter((g) => g.Playtime === 0).length : 0;
		const played = games.length - notPlayed;

		let charts = undefined;
		let top10MostPlayedGames = undefined;
		if (statistics.success) {
			charts = {
				totalPlaytimeOverLast6Months: {
					xAxis: { data: getLastSixMonthsInclusiveAbreviated() },
					series: { bar: { data: statistics.data.totalPlaytimeOverLast6Months } }
				},
				totalGamesOwnedOverLast6Months: {
					xAxis: { data: getLastSixMonthsInclusiveAbreviated() },
					series: { bar: { data: statistics.data.totalGamesOwnedOverLast6Months } }
				}
			};
			top10MostPlayedGames = statistics.data?.top10MostPlayedGames;
		}

		return {
			games,
			total,
			installed,
			notInstalled,
			totalPlayTime,
			notPlayed,
			played,
			charts,
			top10MostPlayedGames
		};
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to get dashboard data');
	}
};
