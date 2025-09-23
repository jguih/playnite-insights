import { withExtensionAuth } from '$lib/server/api/authentication';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, url }) =>
	withExtensionAuth(request, url, 'none', () => {
		return json({ status: 'OK' });
	});
