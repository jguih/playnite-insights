import { instanceAuthMiddleware } from '$lib/server/api/middleware/auth.middleware';
import { type GetAllExtensionRegistrationsResponse } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, locals: { services, api } }) =>
	instanceAuthMiddleware({ request, api }, async () => {
		const registrations = services.extensionRegistrationRepository.all();
		const response: GetAllExtensionRegistrationsResponse = {
			registrations,
		};
		return json(response);
	});
