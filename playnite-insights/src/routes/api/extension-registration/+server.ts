import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { emptyResponse, getAllExtensionRegistrationsSchema } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		const data = services.extensionRegistrationRepository.all();
		if (!data || data.length === 0) {
			return emptyResponse();
		}
		getAllExtensionRegistrationsSchema.parse(data);
		return json(data);
	} catch (err) {
		return handleApiError(err);
	}
};
