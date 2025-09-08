import type { FullGame, PlayniteLibraryMetrics } from '@playnite-insights/lib/client';
import type { GameSignal, LibraryMetricsSignal } from '../app-state/AppData.types';
import { getPlaytimeInHoursAndMinutes } from '../utils/playnite-game';

export type DashPageViewModelProps = {
	gameSignal: GameSignal;
	libraryMetricsSignal: LibraryMetricsSignal;
};

export type DashPageLibraryMetrics = {
	totalGamesInLibrary: number;
	totalPlaytimeSeconds: number;
	played: number;
	notPlayed: number;
	notInstalled: number;
	isInstalled: number;
	topMostPlayedGames: FullGame[];
	gamesOwnedLast6Months: PlayniteLibraryMetrics['gamesOwnedLast6Months'] | null;
};

export class DashPageViewModel {
	#gameSignal: GameSignal;
	#libraryMetricsSignal: LibraryMetricsSignal;
	#libraryMetrics: DashPageLibraryMetrics;

	constructor({ gameSignal, libraryMetricsSignal }: DashPageViewModelProps) {
		this.#gameSignal = gameSignal;
		this.#libraryMetricsSignal = libraryMetricsSignal;

		this.#libraryMetrics = $derived.by(() => {
			return this.getLibraryMetrics();
		});
	}

	private getLibraryMetrics = (): DashPageLibraryMetrics => {
		const games = this.#gameSignal?.raw ?? [];
		const libraryMetrics = this.#libraryMetricsSignal.raw;
		const totalGamesInLibrary = games.length;
		const totalPlaytimeSeconds = games.reduce((prev, current) => prev + current.Playtime, 0);
		const played = games.filter((g) => g.Playtime > 0).length;
		const notPlayed = games.length - played;
		const notInstalled = games.filter((g) => !g.IsInstalled).length;
		const isInstalled = games.length - notInstalled;
		const topMostPlayedGames = [...games].sort((a, b) => b.Playtime - a.Playtime).slice(0, 10);
		const gamesOwnedLast6Months = libraryMetrics?.gamesOwnedLast6Months ?? null;
		return {
			played,
			notPlayed,
			isInstalled,
			notInstalled,
			topMostPlayedGames,
			totalGamesInLibrary,
			totalPlaytimeSeconds,
			gamesOwnedLast6Months,
		};
	};

	get libraryMetrics() {
		return this.#libraryMetrics;
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
