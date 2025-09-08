import { services } from '$lib';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
	const metrics = services.playniteLibrary.getLibraryMetrics();
	return json({ ...metrics });
};
