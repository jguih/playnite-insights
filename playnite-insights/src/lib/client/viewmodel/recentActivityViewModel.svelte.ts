import type { FullGame } from '@playnite-insights/lib/client/playnite-game';
import type { GamesSignal, RecentGameSessionSignal } from '../app-state/AppData.types';
import type { GameActivity, GameSession } from '@playnite-insights/lib/client/game-session';
import type { DateTimeHandler } from '../utils/dateTimeHandler.svelte';

export type RecentActivityViewModelProps = {
	gameSignal: GamesSignal;
	recentGameSessionSignal: RecentGameSessionSignal;
	dateTimeHandler: DateTimeHandler;
};

export class RecentActivityViewModel {
	#gameSignal: RecentActivityViewModelProps['gameSignal'];
	#recentGameSessionSignal: RecentActivityViewModelProps['recentGameSessionSignal'];
	#dateTimeHandler: RecentActivityViewModelProps['dateTimeHandler'];
	#inProgressGame: FullGame | null;
	#inProgressActivity: GameActivity | null;
	#recentActivityMap: Map<string, GameActivity>;
	#tick: number;
	#tickInterval: ReturnType<typeof setInterval> | null;
	#inProgressSessionPlaytime: number | null;
	#inProgressActivityPlaytime: number | null;

	constructor({
		gameSignal,
		recentGameSessionSignal,
		dateTimeHandler,
	}: RecentActivityViewModelProps) {
		this.#gameSignal = gameSignal;
		this.#recentGameSessionSignal = recentGameSessionSignal;
		this.#dateTimeHandler = dateTimeHandler;
		this.#tick = $state(dateTimeHandler.getUtcNow());
		this.#tickInterval = $state(null);

		this.#recentActivityMap = $derived.by(() => {
			const sessions = this.#recentGameSessionSignal.raw ?? [];
			return this.buildRecentActivityMap(sessions);
		});

		this.#inProgressActivity = $derived.by(() => {
			const activitiesMap = this.#recentActivityMap;
			for (const [, activity] of activitiesMap) {
				if (activity.status === 'in_progress') {
					return activity;
				}
			}
			return null;
		});

		this.#inProgressGame = $derived.by(() => {
			const activity = this.#inProgressActivity;
			const games = this.#gameSignal.raw ?? [];
			if (!activity) return null;
			return games.find((g) => g.Id === activity.gameId) ?? null;
		});

		this.#inProgressActivityPlaytime = $derived(this.getInProgressActivityPlaytime());
		this.#inProgressSessionPlaytime = $derived(this.getInProgressSessionPlaytime());
	}

	private getActivityStateFromSession = (session: GameSession): 'in_progress' | 'not_playing' => {
		if (session.Status === 'in_progress') return 'in_progress';
		return 'not_playing';
	};

	private buildRecentActivityMap = (sessions: GameSession[]): Map<string, GameActivity> => {
		const data: Map<string, GameActivity> = new Map();

		for (const session of sessions) {
			const key = session.GameId ? session.GameId : session.GameName;
			if (key === null) continue;

			const currentStatus = this.getActivityStateFromSession(session);
			const duration = session.Duration ?? 0;

			if (!data.has(key)) {
				data.set(key, {
					gameName: session.GameName ?? '',
					gameId: session.GameId ?? '',
					status: currentStatus,
					totalPlaytime: duration,
					sessions: [session],
				});
				continue;
			}

			const value = data.get(key)!;
			value.totalPlaytime += duration;
			value.sessions.push(session);
			if (value.status !== 'in_progress') {
				value.status = currentStatus;
			}
		}
		return data;
	};

	private getInProgressActivityPlaytime = (): number | null => {
		const now = this.#tick;
		if (!this.#inProgressActivity) return null;
		const latestSession = this.#inProgressActivity.sessions.at(0);
		const startTime = latestSession?.StartTime;
		if (!startTime) return null;
		const totalPlaytime = this.#inProgressActivity.totalPlaytime;
		const elapsed = (now - new Date(startTime).getTime()) / 1000;
		return Math.floor(totalPlaytime + elapsed);
	};

	private getInProgressSessionPlaytime = (): number | null => {
		const now = this.#tick;
		if (!this.#inProgressActivity) return null;
		const session = this.#inProgressActivity.sessions.at(0);
		const startTime = session?.StartTime;
		if (!startTime) return null;
		const elapsed = (now - new Date(startTime).getTime()) / 1000;
		return Math.floor(elapsed);
	};

	setTickInterval = () => {
		this.#tickInterval = setInterval(() => (this.#tick = this.#dateTimeHandler.getUtcNow()), 1000);
	};

	clearTickInterval = () => {
		if (this.#tickInterval) clearInterval(this.#tickInterval);
	};

	get inProgressGame() {
		return this.#inProgressGame;
	}

	get inProgressActivity() {
		return this.#inProgressActivity;
	}

	get tick() {
		return this.#tick;
	}

	get recentActivityMap() {
		return this.#recentActivityMap;
	}

	get inProgressSessionPlaytime() {
		return this.#inProgressSessionPlaytime;
	}

	get inProgressActivityPlaytime() {
		return this.#inProgressActivityPlaytime;
	}
}
