import { services } from '$lib';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
	const data = services.publisherRepository.all();
	if (!data) {
		return new Response(undefined, { status: 404 });
	}
	return json(data);
};
