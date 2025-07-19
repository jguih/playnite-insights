import { services } from '$lib';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
	const data = services.dashPage.getPageData();
	return json(data);
};
