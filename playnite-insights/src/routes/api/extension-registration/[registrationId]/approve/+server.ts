import { instanceAuthMiddleware } from "$lib/server/api/middleware/auth.middleware";
import {
	approveExtensionRegistrationRequestDtoSchema,
	makeApproveExtensionRegistrationCommand,
} from "@playatlas/auth/commands";
import type { ApproveExtensionRegistrationResponseDto } from "@playatlas/auth/dtos";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ params, request, locals: { api } }) =>
	instanceAuthMiddleware({ request, api }, async () => {
		const requestDescription = api.getLogService().getRequestDescription(request);
		const { registrationId } = params;
		const { success, data, error } = approveExtensionRegistrationRequestDtoSchema.safeParse({
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
			} satisfies ApproveExtensionRegistrationResponseDto);
		}

		const command = makeApproveExtensionRegistrationCommand(data);

		const result = api.auth.commands
			.getApproveExtensionRegistrationCommandHandler()
			.execute(command);

		if (result.success) {
			return json({
				success: true,
				reason_code: result.reason_code,
				reason: result.reason,
			} satisfies ApproveExtensionRegistrationResponseDto);
		}

		return json(
			{
				success: false,
				reason_code: result.reason_code,
				reason: result.reason,
			} satisfies ApproveExtensionRegistrationResponseDto,
			{ status: result.reason_code === "not_found" ? 404 : 400 },
		);
	});
