import { services } from '$lib';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
	const data = services.dashPage.getPageData();
	if (!data) {
		return new Response(null, { status: 404 });
	}
	return json(data);
};
