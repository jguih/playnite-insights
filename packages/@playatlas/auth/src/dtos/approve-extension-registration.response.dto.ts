import {
	defaultFailedResponseDtoSchema,
	defaultSuccessResponseDtoSchema,
} from "@playatlas/common/dtos";
import z from "zod";
import {
	approveExtensionRegistrationFailedReasonCode,
	approveExtensionRegistrationSuccessReasonCode,
} from "../domain";

const successResponse = z.object({
	...defaultSuccessResponseDtoSchema.shape,
	reason_code: z.enum(approveExtensionRegistrationSuccessReasonCode),
});

const failedResponse = z.object({
	...defaultFailedResponseDtoSchema.shape,
	reason_code: z.enum([...approveExtensionRegistrationFailedReasonCode, "validation_error"]),
});

export const approveExtensionRegistrationResponseDtoSchema = z.discriminatedUnion("success", [
	successResponse,
	failedResponse,
]);

export type ApproveExtensionRegistrationResponseDto = z.infer<
	typeof approveExtensionRegistrationResponseDtoSchema
>;
