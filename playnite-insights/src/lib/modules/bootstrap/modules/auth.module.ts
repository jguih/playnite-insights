import {
	AuthFlow,
	AuthService,
	ExtensionAuthorizationService,
	ExtensionRegistrationClient,
	type IAuthFlowPort,
	type IAuthServicePort,
	type IExtensionAuthorizationServicePort,
	type IExtensionRegistrationClient,
	type ISessionIdProviderPort,
} from "$lib/modules/auth/application";
import type { IClockPort, IHttpClientPort, ILogServicePort } from "$lib/modules/common/application";
import type { IDomainEventBusPort } from "$lib/modules/common/application/event-bus.port";
import type { IAuthModulePort } from "./auth.module.port";

export type AuthModuleDeps = {
	httpClient: IHttpClientPort;
	authenticatedHttpClient: IHttpClientPort;
	dbSignal: IDBDatabase;
	clock: IClockPort;
	logService: ILogServicePort;
	eventBus: IDomainEventBusPort;
	sessionIdProvider: ISessionIdProviderPort;
};

export class AuthModule implements IAuthModulePort {
	readonly authService: IAuthServicePort;
	readonly authFlow: IAuthFlowPort;

	readonly extensionRegistrationClient: IExtensionRegistrationClient;
	readonly extensionAuthorizationService: IExtensionAuthorizationServicePort;

	constructor(private readonly deps: AuthModuleDeps) {
		const { httpClient, authenticatedHttpClient, clock, logService, eventBus, sessionIdProvider } =
			deps;

		this.authService = new AuthService({ httpClient });
		this.authFlow = new AuthFlow({
			authService: this.authService,
			sessionIdProvider: sessionIdProvider,
			logService,
			clock,
			eventBus,
		});

		this.extensionRegistrationClient = new ExtensionRegistrationClient({
			httpClient: authenticatedHttpClient,
		});
		this.extensionAuthorizationService = new ExtensionAuthorizationService({
			httpClient: authenticatedHttpClient,
		});
	}

	initializeAsync = async (): Promise<void> => {
		await this.deps.sessionIdProvider.loadFromDbAsync();
	};

	hasSession: IAuthModulePort["hasSession"] = () => {
		return this.deps.sessionIdProvider.hasSession();
	};
}
