import { services } from '$lib';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const date = url.searchParams.get('date');
	try {
		const data = services.gameSession.recentActivity(date);
		return json(data);
	} catch (err) {
		return json(undefined, { status: 500 });
	}
};
