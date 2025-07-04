import { getLastSixMonthsInclusiveAbreviated } from '$lib/services/date';
import type { GetDashPagePlayniteGameListResult } from '$lib/services/playnite-game-repository';
import { error } from '@sveltejs/kit';
import type { GetDashStatisticsResponse } from '../api/playnite-games/dash/statistics/+server';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const gamesResponse = await fetch(`/api/playnite-games/dash`);
		if (!gamesResponse) {
			throw error(500, 'Failed to get dashboard data');
		}
		const games = (await gamesResponse.json()) as GetDashPagePlayniteGameListResult;
		if (!games) {
			throw error(500, 'Failed to get dashboard data');
		}
		const statisticsResponse = await fetch(`/api/playnite-games/dash/statistics`);
		if (!statisticsResponse) {
			throw error(500, 'Failed to get dashboard data');
		}
		const statistics = (await statisticsResponse.json()) as GetDashStatisticsResponse;
		if (!statistics) {
			throw error(500, 'Failed to get dashboard data');
		}
		const total = games.length;
		const installed = games.filter((g) => g.IsInstalled).length;
		const notInstalled = games.length - installed;
		const totalPlayTime = (
			games.map((g) => g.Playtime).reduce((prev, acc) => prev + acc) / 3600
		).toFixed(2);
		const notPlayed = games.filter((g) => g.Playtime === 0).length;
		const played = games.length - notPlayed;
		const charts = {
			totalPlaytimeOverLast6Months: {
				xAxis: { data: getLastSixMonthsInclusiveAbreviated() },
				series: { bar: { data: statistics.totalPlaytimeOverLast6Months } }
			}
		};

		return {
			games,
			total,
			installed,
			notInstalled,
			totalPlayTime,
			notPlayed,
			played,
			charts
		};
	} catch {
		throw error(500, 'Failed to get dashboard data');
	}
};
