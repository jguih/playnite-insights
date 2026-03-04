export const revokeExtensionRegistrationFailedReasonCode = [
	"not_found",
	"cannot_revoke_pending_registration",
	"cannot_revoke_non_trusted_registration",
] as const satisfies string[];

export type RevokeExtensionRegistrationFailedReasonCode =
	(typeof revokeExtensionRegistrationFailedReasonCode)[number];

export const revokeExtensionRegistrationSuccessReasonCode = [
	"extension_registration_revoked",
	"extension_registration_already_rejected",
] as const satisfies string[];

export type RevokeExtensionRegistrationSuccessReasonCode =
	(typeof revokeExtensionRegistrationSuccessReasonCode)[number];
