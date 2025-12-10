import { extensionAuthMiddleware } from '$lib/server/api/middleware/auth.middleware';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, locals: { api } }) =>
	extensionAuthMiddleware({ request, api }, async () => {
		return json({ status: 'OK' });
	});
