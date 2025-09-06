import type { GetServerTimeResponse } from '@playnite-insights/lib';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({}) => {
	const data: GetServerTimeResponse = {
		utcNow: new Date().toISOString(),
	};
	return json(data);
};
