import { services } from '$lib';
import { withInstanceAuth } from '$lib/server/api/authentication';
import { ValidationError } from '@playnite-insights/lib/client';
import { type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ params, request, url }) =>
	withInstanceAuth(request, url, async () => {
		const { registrationId } = params;
		if (!registrationId || isNaN(Number(registrationId))) {
			throw new ValidationError({ message: 'Missing or invalid registrationId' });
		}
		services.extensionRegistration.reject(Number(registrationId));
		return new Response(null, { status: 200 });
	});
