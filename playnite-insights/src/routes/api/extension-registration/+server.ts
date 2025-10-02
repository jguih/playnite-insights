import { services } from '$lib';
import { withInstanceAuth } from '$lib/server/api/authentication';
import { type GetAllExtensionRegistrationsResponse } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, url }) =>
	withInstanceAuth(request, url, async () => {
		const registrations = services.extensionRegistrationRepository.all();
		const response: GetAllExtensionRegistrationsResponse = {
			registrations,
		};
		return json(response);
	});
