import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, url }) => {
	try {
		const isAuthorized = services.authentication.verifyExtensionAuthorization({
			request,
			url,
		});
		if (!isAuthorized) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}
		return json({ status: 'OK' });
	} catch (error) {
		return handleApiError(error, `${request.method} ${url.pathname}`);
	}
};
