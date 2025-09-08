import { monthNames } from '$lib/utils/date';
import type { FullGame } from '@playnite-insights/lib/client';
import type { GameSignal, LibraryMetricsSignal } from '../app-state/AppData.types';
import { getPlaytimeInHoursAndMinutes } from '../utils/playnite-game';

export type DashPageViewModelProps = {
	gameSignal: GameSignal;
	libraryMetricsSignal: LibraryMetricsSignal;
};

export type DashPageLibraryMetrics = {
	totalGamesInLibrary: number;
	totalPlaytimeSeconds: number;
	totalPlaytime: string;
	played: number;
	notPlayed: number;
	notInstalled: number;
	isInstalled: number;
	topMostPlayedGames: FullGame[];
};

export type DashPageChartsData = {
	gamesOwnedLast6Months: {
		months: string[];
		count: number[];
	};
};

export class DashPageViewModel {
	#gameSignal: GameSignal;
	#libraryMetricsSignal: LibraryMetricsSignal;
	#libraryMetrics: DashPageLibraryMetrics;
	#chartsData: DashPageChartsData | null;

	constructor({ gameSignal, libraryMetricsSignal }: DashPageViewModelProps) {
		this.#gameSignal = gameSignal;
		this.#libraryMetricsSignal = libraryMetricsSignal;

		this.#libraryMetrics = $derived.by(() => {
			return this.getLibraryMetrics();
		});

		this.#chartsData = $derived.by(() => {
			return this.getChartsData();
		});
	}

	private getLibraryMetrics = (): DashPageLibraryMetrics => {
		const games = this.#gameSignal?.raw ?? [];
		const totalGamesInLibrary = games.length;
		const totalPlaytimeSeconds = games.reduce((prev, current) => prev + current.Playtime, 0);
		const totalPlaytime = getPlaytimeInHoursAndMinutes(totalPlaytimeSeconds);
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
			totalPlaytime,
		};
	};

	private getChartsData = (): DashPageChartsData => {
		const libraryMetrics = this.#libraryMetricsSignal.raw;
		const data = libraryMetrics?.gamesOwnedLast6Months ?? null;
		const gamesOwnedLast6Months: DashPageChartsData['gamesOwnedLast6Months'] = {
			count: [],
			months: [],
		};
		data?.forEach((d) => {
			gamesOwnedLast6Months.count.push(d.count);
			gamesOwnedLast6Months.months.push(monthNames[d.monthIndex].substring(0, 3) + '.');
		});

		return {
			gamesOwnedLast6Months,
		};
	};

	get libraryMetrics() {
		return this.#libraryMetrics;
	}

	get chartsData() {
		return this.#chartsData;
	}

	get playedPercentage(): number {
		return this.#libraryMetrics.totalGamesInLibrary > 0
			? Math.floor((this.#libraryMetrics.played * 100) / this.#libraryMetrics.totalGamesInLibrary)
			: 0;
	}

	getPlaytime = (playtime: number): string => getPlaytimeInHoursAndMinutes(playtime);
}
