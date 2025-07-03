import { getDb } from '$lib/infrastructure/database';
import { z } from 'zod';
import { logDebug, logError, logSuccess } from './log';
import type { ValidationResult } from '$lib/models/validation-result';

const totalPlaytimeOverTimeSchema = z.array(
	z.object({
		totalPlaytimeHours: z.number(),
		yearMonth: z.string()
	})
);

export const getTotalPlaytimeOverTime = (): ValidationResult<
	z.infer<typeof totalPlaytimeOverTimeSchema>
> => {
	const query = `
      SELECT MAX(totalPlaytimeHours) as totalPlaytimeHours, strftime('%Y-%m', timestamp) as yearMonth
      FROM playnite_library_sync
      WHERE timestamp >= datetime('now', '-6 months')
      GROUP BY yearMonth
      ORDER BY yearMonth;
    `;
	logDebug(`Querying total playtime over time, running: \n${query}`);
	try {
		const stmt = getDb().prepare(query);
		const result = stmt.all();
		const data = totalPlaytimeOverTimeSchema.parse(result);
		const graphData = Array(6).fill(0);
		for (const entry of data) {
			const [, month] = entry.yearMonth.split('-');
			graphData[Number(month) - 1] = Math.floor(entry.totalPlaytimeHours);
		}
		logDebug('\n' + JSON.stringify(graphData, null, 2));
		logSuccess('Successfully queried total playtime over time');
		return {
			isValid: true,
			message: '',
			data: data,
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
