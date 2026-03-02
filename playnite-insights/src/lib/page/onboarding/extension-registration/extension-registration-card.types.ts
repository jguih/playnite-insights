import type { extensionRegistrationAuthorizationAction } from "./extension-registration-card.constants";

export type ExtensionRegistrationAuthorizationAction =
	(typeof extensionRegistrationAuthorizationAction)[number];
