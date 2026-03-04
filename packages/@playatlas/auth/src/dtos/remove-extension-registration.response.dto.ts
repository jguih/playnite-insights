import {
	defaultFailedResponseDtoSchema,
	defaultSuccessResponseDtoSchema,
} from "@playatlas/common/dtos";
import z from "zod";
import {
	removeExtensionRegistrationFailedReasonCode,
	removeExtensionRegistrationSuccessReasonCode,
} from "../domain/value-object/remove-extension-registration-reason-code";

const successResponse = z.object({
	...defaultSuccessResponseDtoSchema.shape,
	reason_code: z.enum(removeExtensionRegistrationSuccessReasonCode),
});

const failedResponse = z.object({
	...defaultFailedResponseDtoSchema.shape,
	reason_code: z.enum([...removeExtensionRegistrationFailedReasonCode, "validation_error"]),
});

export const removeExtensionRegistrationResponseDtoSchema = z.discriminatedUnion("success", [
	successResponse,
	failedResponse,
]);

export type RemoveExtensionRegistrationResponseDto = z.infer<
	typeof removeExtensionRegistrationResponseDtoSchema
>;
