import { getDb } from '$lib/infrastructure/database';
import { z } from 'zod';
import { logDebug, logError, logSuccess } from './log';
import type { ValidationResult } from '$lib/models/validation-result';

const totalPlaytimeOverTimeSchema = z.array(
	z.object({
		totalPlaytimeHours: z.number()
	})
);

export const getTotalPlaytimeOverLast6Months = (): ValidationResult<number[]> => {
	const query = `
      SELECT totalPlaytimeHours FROM (
        SELECT MAX(totalPlaytimeHours) as totalPlaytimeHours, strftime('%Y-%m', timestamp) as yearMonth
        FROM playnite_library_sync
        WHERE timestamp >= datetime('now', '-6 months')
        GROUP BY yearMonth
        ORDER BY yearMonth
      );
    `;
	logDebug(`Querying total playtime over time, running: \n${query}`);
	try {
		const stmt = getDb().prepare(query);
		const result = stmt.all();
		const data = totalPlaytimeOverTimeSchema.parse(result);
		logSuccess('Successfully queried total playtime over time');
		return {
			isValid: true,
			message: '',
			data: data.map((e) => e.totalPlaytimeHours),
			httpCode: 200
		};
	} catch (error) {
		logError('Failed to get total playtime over time', error as Error);
		return {
			isValid: false,
			message: 'Failed to get total playtime over time',
			httpCode: 500
		};
	}
};
