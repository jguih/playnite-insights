import { getDb } from '$lib/infrastructure/database';
import { z } from 'zod';
import { logDebug, logError, logSuccess } from './log';

const totalPlaytimeOverTimeSchema = z.array(
	z.object({
		totalPlaytimeHours: z.number()
	})
);
export type GetTotalPlaytimeOverLast6MonthsResult = ReturnType<
	typeof getTotalPlaytimeOverLast6Months
>;
export const getTotalPlaytimeOverLast6Months = ():
	| { totalPlaytimeOverLast6Months: number[] }
	| undefined => {
	const query = `
      SELECT totalPlaytimeHours FROM (
        SELECT MAX(totalPlaytimeHours) as totalPlaytimeHours, strftime('%Y-%m', timestamp) as yearMonth
        FROM playnite_library_sync
        WHERE timestamp >= datetime('now', '-6 months')
        GROUP BY yearMonth
        ORDER BY yearMonth
      );
    `;
	logDebug(`Querying total playtime over last 6 months, running: \n${query}`);
	try {
		const stmt = getDb().prepare(query);
		const result = stmt.all();
		const data = totalPlaytimeOverTimeSchema.parse(result);
		logSuccess('Successfully queried total playtime over last 6 months');
		return { totalPlaytimeOverLast6Months: data.map((e) => e.totalPlaytimeHours) };
	} catch (error) {
		logError('Failed to get total playtime over last 6 months', error as Error);
		return undefined;
	}
};
