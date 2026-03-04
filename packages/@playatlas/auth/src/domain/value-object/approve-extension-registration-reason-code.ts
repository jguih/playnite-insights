export const approveExtensionRegistrationFailedReasonCode = [
	"not_found",
	"cannot_approve_rejected_registration",
	"cannot_approve_non_pending_registration",
] as const satisfies string[];

export type ApproveExtensionRegistrationFailedReasonCode =
	(typeof approveExtensionRegistrationFailedReasonCode)[number];

export const approveExtensionRegistrationSuccessReasonCode = [
	"extension_registration_approved",
	"extension_registration_already_approved",
] as const satisfies string[];

export type ApproveExtensionRegistrationSuccessReasonCode =
	(typeof approveExtensionRegistrationSuccessReasonCode)[number];
