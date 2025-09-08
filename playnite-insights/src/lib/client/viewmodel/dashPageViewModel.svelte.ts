import type { DashPageData, FullGame } from '@playnite-insights/lib/client';
import type { DashSignal, GameSignal } from '../app-state/AppData.types';
import { getPlaytimeInHoursAndMinutes } from '../utils/playnite-game';

export type DashPageViewModelProps = {
	dashSignal: DashSignal;
	gameSignal: GameSignal;
};

export type DashPageLibraryMetrics = {
	totalGamesInLibrary: number;
	totalPlaytimeSeconds: number;
	played: number;
	notPlayed: number;
	notInstalled: number;
	isInstalled: number;
	topMostPlayedGames: FullGame[];
};

export const defaultPageData: DashPageData = {
	totalGamesInLibrary: 0,
	totalPlaytimeSeconds: 0,
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

export class DashPageViewModel {
	#data: DashPageData;
	#gameSignal: GameSignal;
	#libraryMetrics: DashPageLibraryMetrics;

	constructor({ dashSignal, gameSignal }: DashPageViewModelProps) {
		this.#gameSignal = gameSignal;

		this.#data = $derived.by(() => {
			const pageData = dashSignal.pageData;
			if (pageData) return pageData;
			return defaultPageData;
		});

		this.#libraryMetrics = $derived.by(() => {
			return this.getLibraryMetrics();
		});
	}

	private getLibraryMetrics = (): DashPageLibraryMetrics => {
		const games = this.#gameSignal?.raw ?? [];
		const totalGamesInLibrary = games.length;
		const totalPlaytimeSeconds = games.reduce((prev, current) => prev + current.Playtime, 0);
		const played = games.filter((g) => g.Playtime > 0).length;
		const notPlayed = games.length - played;
		const notInstalled = games.filter((g) => !g.IsInstalled).length;
		const isInstalled = games.length - notInstalled;
		const topMostPlayedGames = [...games].sort((a, b) => b.Playtime - a.Playtime).slice(0, 10);
		return {
			played,
			notPlayed,
			isInstalled,
			notInstalled,
			topMostPlayedGames,
			totalGamesInLibrary,
			totalPlaytimeSeconds,
		};
	};

	get libraryMetrics() {
		return this.#libraryMetrics;
	}

	get data(): DashPageData {
		return this.#data;
	}

	get playedPercentage(): number {
		return this.#libraryMetrics.totalGamesInLibrary > 0
			? Math.floor((this.#libraryMetrics.played * 100) / this.#libraryMetrics.totalGamesInLibrary)
			: 0;
	}

	get totalPlaytime(): string {
		const playtimeSeconds = this.#libraryMetrics.totalPlaytimeSeconds;
		return getPlaytimeInHoursAndMinutes(playtimeSeconds);
	}

	getPlaytime = (playtime: number): string => getPlaytimeInHoursAndMinutes(playtime);
}
