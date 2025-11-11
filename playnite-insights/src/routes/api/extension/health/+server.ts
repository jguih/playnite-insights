import { withExtensionAuth } from '$lib/infra/api/authentication';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, url, locals: { services } }) =>
	withExtensionAuth(request, url, services, 'none', () => {
		return json({ status: 'OK' });
	});
