import { json, type RequestHandler } from '@sveltejs/kit';
import { services } from '$lib';

export const GET: RequestHandler = ({ params }) => {
	const { id } = params;
	if (!id) {
		return json({ message: 'id required' }, { status: 400 });
	}
	const data = services.gamePage.getData(id);
	if (!data) {
		return new Response(null, { status: 404 });
	}
	return json(data);
};
