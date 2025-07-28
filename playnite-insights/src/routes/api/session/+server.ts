import { services } from '$lib';
import type { GameSession } from '@playnite-insights/lib';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	let sessions: GameSession[] | undefined = undefined;

	if (url.searchParams.has('date')) {
		const date = url.searchParams.get('date');
		const today = new Date();
		const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		const end = new Date(start);
		end.setDate(end.getDate() + 1);

		services.log.debug(
			`Fetching game sessions between ${start.toISOString()} and ${end.toISOString()}`
		);

		if (date === 'today')
			sessions = services.gameSessionRepository.findAllBy({
				filters: { date: { start: start.toISOString(), end: end.toISOString() } }
			});
	} else {
		sessions = services.gameSessionRepository.all();
	}

	if (!sessions) {
		return new Response(undefined, { status: 404 });
	}
	return json(sessions);
};
