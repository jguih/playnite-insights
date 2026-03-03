export const removeExtensionRegistrationFailedReasonCode = [
	"not_found",
] as const satisfies string[];

export type RemoveExtensionRegistrationFailedReasonCode =
	(typeof removeExtensionRegistrationFailedReasonCode)[number];

export const removeExtensionRegistrationSuccessReasonCode = [
	"extension-registration-removed",
] as const satisfies string[];

export type RemoveExtensionRegistrationSuccessReasonCode =
	(typeof removeExtensionRegistrationSuccessReasonCode)[number];
