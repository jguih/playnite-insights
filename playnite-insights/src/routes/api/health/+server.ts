import { withInstanceAuth } from '$lib/infra/api/authentication';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, url, locals: { services } }) =>
	withInstanceAuth(request, url, services, async () => {
		return json({ status: 'OK' });
	});
