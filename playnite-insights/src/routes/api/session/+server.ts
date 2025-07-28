import { services } from '$lib';
import type { GameSession } from '@playnite-insights/lib';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	let sessions: GameSession[] | undefined = undefined;

	if (url.searchParams.has('date')) {
		const date = url.searchParams.get('date');
		const today = new Date().toISOString().split('T')[0];
		const isToday = date === 'today' || date === today;
		if (isToday) sessions = services.gameSessionRepository.findAllBy({ filters: { date: today } });
	} else {
		sessions = services.gameSessionRepository.all();
	}

	if (!sessions) {
		return new Response(undefined, { status: 404 });
	}
	return json(sessions);
};
