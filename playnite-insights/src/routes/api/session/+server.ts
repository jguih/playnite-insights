import { services } from '$lib';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const sessions = services.gameSession.all();
	if (!sessions) {
		return new Response(undefined, { status: 404 });
	}
	return json(sessions);
};
