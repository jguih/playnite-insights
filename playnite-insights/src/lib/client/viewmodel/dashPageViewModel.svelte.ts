import type { DashPageData } from '@playnite-insights/lib/client';
import type { DashSignal } from '../app-state/AppData.types';
import { getPlaytimeInHoursAndMinutes } from '../utils/playnite-game';

export type DashPageViewModelProps = {
	dashSignal: DashSignal;
};

export class DashPageViewModel {
	#data: DashPageData;

	constructor({ dashSignal }: DashPageViewModelProps) {
		this.#data = $derived.by(() => {
			const pageData = dashSignal.pageData;
			if (pageData) return pageData;
			return {
				total: 0,
				totalPlaytime: 0,
				played: 0,
				notPlayed: 0,
				notInstalled: 0,
				isInstalled: 0,
				topMostPlayedGames: [],
				gameSessionsFromLast7Days: [],
				charts: {
					totalGamesOwnedOverLast6Months: { xAxis: { data: [] }, series: { bar: { data: [] } } },
					totalPlaytimeOverLast6Months: { xAxis: { data: [] }, series: { bar: { data: [] } } },
				},
			};
		});
	}

	get data(): DashPageData {
		return this.#data;
	}

	get playedPercentage(): number {
		const pageData = this.#data;
		return pageData && pageData.total > 0
			? Math.floor((pageData.played * 100) / pageData.total)
			: 0;
	}

	get totalPlaytime(): string {
		const pageData = this.#data;
		return getPlaytimeInHoursAndMinutes(pageData.totalPlaytime);
	}

	getPlaytime = (playtime: number): string => getPlaytimeInHoursAndMinutes(playtime);
}
