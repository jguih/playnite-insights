import { instanceAuthMiddleware } from '$lib/server/api/middleware/auth.middleware';
import { apiResponse, type ApiErrorResponse } from '$lib/server/api/responses';
import { removeExtensionRegistrationRequestDtoSchema } from '@playatlas/auth/commands';
import { type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ params, request, locals: { api } }) =>
	instanceAuthMiddleware({ request, api }, async () => {
		const { registrationId } = params;
		const { data, success, error } = removeExtensionRegistrationRequestDtoSchema.safeParse({
			registrationId: Number(registrationId),
		});
		if (!success)
			return apiResponse.error({
				error: { message: 'Validation error', details: error.issues },
			});

		const result = api.auth.commands.getRemoveExtensionRegistrationCommandHandler().execute({
			registrationId: data.registrationId,
		});

		if (result.success) return apiResponse.success();

		const response: ApiErrorResponse = { error: { message: result.reason } };
		if (result.reason_code === 'not_found') return apiResponse.error(response, { status: 404 });
		else return apiResponse.error(response);
	});
