import { getLastSixMonthsInclusiveAbreviated } from '$lib/services/date';
import { getGameList } from '$lib/services/game-repository';
import { logDebug } from '$lib/services/log';
import { getTotalPlaytimeOverLast6Months } from '$lib/services/playnite-library-sync-repository';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async () => {
	const games = await getGameList();
	const total = games.length;
	const installed = games.filter((g) => g.IsInstalled).length;
	const notInstalled = games.length - installed;
	const totalPlayTime = (
		games.map((g) => g.Playtime).reduce((prev, acc) => prev + acc) / 3600
	).toFixed(2);
	const notPlayed = games.filter((g) => g.Playtime === 0).length;
	const played = games.length - notPlayed;

	const totalPlaytimeOverLast6Months = getTotalPlaytimeOverLast6Months();
	let chartsTotalplaytimeOverLast6Months = null;
	if (totalPlaytimeOverLast6Months.isValid && totalPlaytimeOverLast6Months.data) {
		chartsTotalplaytimeOverLast6Months = {
			xAxis: { data: getLastSixMonthsInclusiveAbreviated() },
			series: { bar: { data: totalPlaytimeOverLast6Months.data } }
		};
	}

	const charts = {
		totalPlaytimeOverLast6Months: chartsTotalplaytimeOverLast6Months
	};

	logDebug(`Charts data: \n${JSON.stringify(charts, null, 2)}`);

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
};
