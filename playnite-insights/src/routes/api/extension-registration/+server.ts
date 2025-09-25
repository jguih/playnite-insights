import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { type GetAllExtensionRegistrationsResponse } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		const registrations = services.extensionRegistrationRepository.all();
		const response: GetAllExtensionRegistrationsResponse = {
			registrations,
		};
		return json(response);
	} catch (err) {
		return handleApiError(err);
	}
};
