import { json, type RequestHandler } from '@sveltejs/kit';
import { services } from '$lib';

export const GET: RequestHandler = ({ params }) => {
	const data = services.playniteGameRepository.all();
	if (!data) {
		return new Response(undefined, { status: 404 });
	}
	return json(data);
};
