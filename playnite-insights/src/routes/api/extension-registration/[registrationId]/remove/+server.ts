import { instanceAuthMiddleware } from "$lib/server/api/middleware/auth.middleware";
import {
	makeRemoveExtensionRegistrationCommand,
	removeExtensionRegistrationRequestDtoSchema,
} from "@playatlas/auth/commands";
import type { RemoveExtensionRegistrationResponseDto } from "@playatlas/auth/dtos";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ params, request, locals: { api } }) =>
	instanceAuthMiddleware({ request, api }, async () => {
		const requestDescription = api.getLogService().getRequestDescription(request);
		const { registrationId } = params;
		const { data, success, error } = removeExtensionRegistrationRequestDtoSchema.safeParse({
			registrationId: Number(registrationId),
		});

		if (!success) {
			api
				.getLogService()
				.error(
					`${requestDescription}: Validation error while handling request`,
					error.issues.slice(0, 10),
				);

			return json({
				success: false,
				reason_code: "validation_error",
				reason: error.message,
				details: error.issues,
			} satisfies RemoveExtensionRegistrationResponseDto);
		}

		const command = makeRemoveExtensionRegistrationCommand(data);

		const result = api.auth.commands
			.getRemoveExtensionRegistrationCommandHandler()
			.execute(command);

		if (result.success) {
			return json({
				success: true,
				reason_code: result.reason_code,
				reason: result.reason,
			} satisfies RemoveExtensionRegistrationResponseDto);
		}

		return json(
			{
				success: false,
				reason_code: result.reason_code,
				reason: result.reason,
			} satisfies RemoveExtensionRegistrationResponseDto,
			{ status: result.reason_code === "not_found" ? 404 : 400 },
		);
	});
