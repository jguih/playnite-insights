import { services } from '$lib';
import { withInstanceAuth } from '$lib/server/api/authentication';
import { ApiError } from '@playnite-insights/lib/client';
import { type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ params, request, url }) =>
	withInstanceAuth(request, url, async () => {
		const { registrationId } = params;
		if (!registrationId || isNaN(Number(registrationId))) {
			const message = 'Missing or invalid registrationId';
			throw new ApiError({ error: { code: 'bad_request', message } }, message, 400);
		}
		services.extensionRegistration.revoke(Number(registrationId));
		return new Response(null, { status: 200 });
	});
