import { m } from '$lib/paraglide/messages';
import { dashPageDataSchema, type DashPageData } from '@playnite-insights/lib';
import { getFormattedPlaytime } from '../utils/playnite-game';

export const makeDashPageViewModel = (promise: Promise<Response>) => {
	let pageData: DashPageData | undefined;
	let isError: boolean = false;

	const getTotal = (): number => pageData?.total ?? 0;
	const getIsInstalled = (): number => pageData?.isInstalled ?? 0;
	const getNotInstalled = (): number => pageData?.notInstalled ?? 0;
	const getTotalPlaytime = (): string => {
		if (pageData?.totalPlaytime && pageData.totalPlaytime > 0) {
			return getFormattedPlaytime(pageData.totalPlaytime);
		}
		return m.game_playtime_in_hours_and_minutes({ hours: 0, mins: 0 });
	};
	const getPlaytime = (playtime: number): string => getFormattedPlaytime(playtime);
	const getTotalPlayedPercent = (): number =>
		pageData && pageData.total > 0 ? Math.floor((pageData.played * 100) / pageData.total) : 0;
	const getCharts = (): DashPageData['charts'] =>
		pageData
			? pageData.charts
			: {
					totalGamesOwnedOverLast6Months: { xAxis: { data: [] }, series: { bar: { data: [] } } },
					totalPlaytimeOverLast6Months: { xAxis: { data: [] }, series: { bar: { data: [] } } }
				};
	const getPlayed = (): number => pageData?.played ?? 0;
	const getTop10MostPlayedGames = (): DashPageData['topMostPlayedGames'] =>
		pageData?.topMostPlayedGames ?? [];
	const getIsError = (): boolean => isError;

	const load = async () => {
		try {
			const response = await promise;
			pageData = dashPageDataSchema.parse(await response.json());
			isError = false;
		} catch (error) {
			console.error(error);
			isError = true;
		}
	};

	return {
		load,
		getTotal,
		getIsInstalled,
		getNotInstalled,
		getTotalPlaytime,
		getPlaytime,
		getTotalPlayedPercent,
		getCharts,
		getPlayed,
		getTop10MostPlayedGames,
		getIsError
	};
};
