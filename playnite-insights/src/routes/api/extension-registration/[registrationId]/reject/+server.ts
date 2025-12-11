import { instanceAuthMiddleware } from '$lib/server/api/middleware/auth.middleware';
import { apiResponse, type ApiErrorResponse } from '$lib/server/api/responses';
import { rejectExtensionRegistrationRequestDtoSchema } from '@playatlas/auth/commands';
import { type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ params, request, locals: { api } }) =>
	instanceAuthMiddleware({ request, api }, async () => {
		const { registrationId } = params;
		const { success, data, error } = rejectExtensionRegistrationRequestDtoSchema.safeParse({
			registrationId: Number(registrationId),
		});
		if (!success)
			return apiResponse.error({
				error: { message: 'Validation error', details: error.issues },
			});
		const result = api.auth.commands
			.getRejectExtensionRegistrationCommandHandler()
			.execute({ registrationId: data.registrationId });

		if (result.success) return apiResponse.success();

		const response: ApiErrorResponse = { error: { message: result.reason } };
		if (result.reason_code === 'not_found') return apiResponse.error(response, { status: 404 });
		else return apiResponse.error(response);
	});
