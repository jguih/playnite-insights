import { withInstanceAuth } from '$lib/infra/api/authentication';
import { ApiError } from '$lib/infra/api/error';
import { type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ params, request, url, locals: { services } }) =>
	withInstanceAuth(request, url, services, async () => {
		const { registrationId } = params;
		if (!registrationId || isNaN(Number(registrationId))) {
			const message = 'Missing or invalid registrationId';
			throw new ApiError({ error: { code: 'bad_request', message } }, message, 400);
		}
		services.extensionRegistrationService.remove(Number(registrationId));
		return new Response(null, { status: 200 });
	});
