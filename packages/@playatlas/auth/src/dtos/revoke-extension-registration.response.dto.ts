import {
	defaultFailedResponseDtoSchema,
	defaultSuccessResponseDtoSchema,
} from "@playatlas/common/dtos";
import z from "zod";
import {
	revokeExtensionRegistrationFailedReasonCode,
	revokeExtensionRegistrationSuccessReasonCode,
} from "../domain/value-object/revoke-extension-registration-reason-code";

const successResponse = z.object({
	...defaultSuccessResponseDtoSchema.shape,
	reason_code: z.enum(revokeExtensionRegistrationSuccessReasonCode),
});

const failedResponse = z.object({
	...defaultFailedResponseDtoSchema.shape,
	reason_code: z.enum([...revokeExtensionRegistrationFailedReasonCode, "validation_error"]),
});

export const revokeExtensionRegistrationResponseDtoSchema = z.discriminatedUnion("success", [
	successResponse,
	failedResponse,
]);

export type RevokeExtensionRegistrationResponseDto = z.infer<
	typeof revokeExtensionRegistrationResponseDtoSchema
>;
