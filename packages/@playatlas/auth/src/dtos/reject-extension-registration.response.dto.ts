import {
	defaultFailedResponseDtoSchema,
	defaultSuccessResponseDtoSchema,
} from "@playatlas/common/dtos";
import z from "zod";
import {
	rejectExtensionRegistrationFailedReasonCode,
	rejectExtensionRegistrationSuccessReasonCode,
} from "../domain/value-object/reject-extension-registration-reason-code";

const successResponse = z.object({
	...defaultSuccessResponseDtoSchema.shape,
	reason_code: z.enum(rejectExtensionRegistrationSuccessReasonCode),
});

const failedResponse = z.object({
	...defaultFailedResponseDtoSchema.shape,
	reason_code: z.enum([...rejectExtensionRegistrationFailedReasonCode, "validation_error"]),
});

export const rejectExtensionRegistrationResponseDtoSchema = z.discriminatedUnion("success", [
	successResponse,
	failedResponse,
]);

export type RejectExtensionRegistrationResponseDto = z.infer<
	typeof rejectExtensionRegistrationResponseDtoSchema
>;
