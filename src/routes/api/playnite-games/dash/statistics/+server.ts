import {
	getTotalPlaytimeOverLast6Months,
	type GetTotalPlaytimeOverLast6MonthsResult
} from '$lib/services/playnite-library-sync-repository';
import { json, type RequestHandler } from '@sveltejs/kit';

export type GetDashStatisticsResponse = GetTotalPlaytimeOverLast6MonthsResult;

export const GET: RequestHandler = () => {
	const totalPlaytimeOverLast6Months = getTotalPlaytimeOverLast6Months();
	if (!totalPlaytimeOverLast6Months) {
		return json(null, { status: 404 });
	}
	return json({ ...totalPlaytimeOverLast6Months });
};
