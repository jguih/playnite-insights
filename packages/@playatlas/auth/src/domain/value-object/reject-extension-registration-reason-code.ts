export const rejectExtensionRegistrationFailedReasonCode = [
	"not_found",
	"cannot_reject_approved_registration",
	"cannot_reject_non_pending_registration",
] as const satisfies string[];

export type RejectExtensionRegistrationFailedReasonCode =
	(typeof rejectExtensionRegistrationFailedReasonCode)[number];

export const rejectExtensionRegistrationSuccessReasonCode = [
	"extension_registration_rejected",
	"extension_registration_already_rejected",
] as const satisfies string[];

export type RejectExtensionRegistrationSuccessReasonCode =
	(typeof rejectExtensionRegistrationSuccessReasonCode)[number];
