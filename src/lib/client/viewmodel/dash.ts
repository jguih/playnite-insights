import { dashPageDataSchema, type DashPageData } from '$lib/services/dashboard-page/schemas';
import { getPlaytimeInHours } from '../utils/playnite-game';

export const makeDashPageViewModel = (promise: Promise<Response>) => {
	let pageData: DashPageData | undefined;

	const getTotal = (): number => pageData?.total ?? 0;
	const getIsInstalled = (): number => pageData?.isInstalled ?? 0;
	const getNotInstalled = (): number => pageData?.notInstalled ?? 0;
	const getTotalPlaytime = (): string =>
		pageData ? getPlaytimeInHours(pageData.totalPlaytime) : '0';
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
	const getTop10MostPlayedGames = (): DashPageData['top10MostPlayedGames'] =>
		pageData?.top10MostPlayedGames ?? [];

	const load = async () => {
		try {
			const response = await promise;
			pageData = dashPageDataSchema.parse(await response.json());
		} catch {
			return;
		}
	};

	return {
		load,
		getTotal,
		getIsInstalled,
		getNotInstalled,
		getTotalPlaytime,
		getTotalPlayedPercent,
		getCharts,
		getPlayed,
		getTop10MostPlayedGames
	};
};
