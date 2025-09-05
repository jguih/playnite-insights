import type { GameActivity } from '@playnite-insights/lib/client/game-session';

/**
 * Returns the current in progress activity playtime as
 * the sum of the activity's total playtime and the time
 * elapsed since its start time.
 */
export const getInProgressActivityPlaytime = ({
	inProgressActivity,
	now
}: {
	inProgressActivity: GameActivity | null;
	now: number;
}) => {
	if (!inProgressActivity) return;
	const latestSession = inProgressActivity.sessions.at(0);
	const startTime = latestSession?.StartTime;
	if (!startTime) return;
	const totalPlaytime = inProgressActivity.totalPlaytime;
	const elapsed = (now - new Date(startTime).getTime()) / 1000;
	return Math.floor(totalPlaytime + elapsed);
};

export const getInProgressSessionPlaytime = ({
	inProgressActivity,
	now
}: {
	inProgressActivity: GameActivity | null;
	now: number;
}) => {
	if (!inProgressActivity) return;
	const session = inProgressActivity.sessions.at(0);
	const startTime = session?.StartTime;
	if (!startTime) return;
	const elapsed = (now - new Date(startTime).getTime()) / 1000;
	return Math.floor(elapsed);
};
