import { getLastSixMonthsInclusiveAbreviated } from '$lib/utils/date';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import {
	dashPagePlayniteGameListSchema,
	statisticsResponseSchema
} from '$lib/playnite-game/schemas';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const gamesResponse = await fetch(`/api/playnite-games/dash`);
		const games = dashPagePlayniteGameListSchema.parse(await gamesResponse.json());
		const statisticsResponse = await fetch(`/api/playnite-games/dash/statistics`);
		const statistics = statisticsResponseSchema.safeParse(await statisticsResponse.json());

		const total = games.length;
		const installed = games.filter((g) => Boolean(g.IsInstalled)).length;
		const notInstalled = games.length - installed;
		const totalPlayTime = (
			games.map((g) => g.Playtime).reduce((prev, acc) => prev + acc) / 3600
		).toFixed(1);
		const notPlayed = games.filter((g) => g.Playtime === 0).length;
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
