import type {
	IAuthFlowPort,
	IAuthServicePort,
	IExtensionAuthorizationServicePort,
	IExtensionRegistrationClient,
} from "$lib/modules/auth/application";

export interface IAuthModulePort {
	get authService(): IAuthServicePort;
	get authFlow(): IAuthFlowPort;

	get extensionRegistrationClient(): IExtensionRegistrationClient;
	get extensionAuthorizationService(): IExtensionAuthorizationServicePort;

	initializeAsync: () => Promise<void>;

	hasSession: () => boolean;
}
