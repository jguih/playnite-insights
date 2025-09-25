import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { ValidationError } from '@playnite-insights/lib/client';
import { type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ params }) => {
	try {
		const { registrationId } = params;
		if (!registrationId || isNaN(Number(registrationId))) {
			throw new ValidationError({ message: 'Missing or invalid registrationId' });
		}
		services.extensionRegistration.reject(Number(registrationId));
		return new Response(null, { status: 200 });
	} catch (err) {
		return handleApiError(err);
	}
};
