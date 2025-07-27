import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
	// TODO
	return json({ status: 'OK' });
};
