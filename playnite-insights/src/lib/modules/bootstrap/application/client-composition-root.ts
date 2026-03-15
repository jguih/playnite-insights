import { SessionIdMapper, SessionIdProvider } from "$lib/modules/auth/application";
import { SessionIdRepository, sessionIdRepositorySchema } from "$lib/modules/auth/infra";
import {
	AuthenticatedHttpClient,
	EventBus,
	HttpClient,
	LogService,
	PlayAtlasSSEClient,
	type IClockPort,
	type IDomainEventBusPort,
	type ILogServicePort,
	type IPlayAtlasSSEClientPort,
} from "$lib/modules/common/application";
import { PlayAtlasClient } from "$lib/modules/common/application/playatlas-client";
import { Clock } from "$lib/modules/common/infra";
import {
	companyRepositorySchema,
	completionStatusRepositorySchema,
	gameClassificationRepositorySchema,
	gameLibraryFilterRepositorySchema,
	gameRecommendationRecordStoreSchema,
	gameRepositorySchema,
	gameVectorStoreSchema,
	genreRepositorySchema,
	platformRepositorySchema,
} from "$lib/modules/game-library/infra";
import { GameSessionReadonlyStore, gameSessionStoreSchema } from "$lib/modules/game-session/infra";
import { SyncRunner } from "$lib/modules/synchronization/application/sync-runner";
import {
	ClientGameLibraryModule,
	ClientInfraModule,
	GameSessionModule,
	SynchronizationModule,
	type IClientGameLibraryModulePort,
	type IClientGameSessionModulePort,
	type IClientInfraModulePort,
	type ISynchronizationModulePort,
} from "../modules";
import { AuthModule } from "../modules/auth.module";
import type { IAuthModulePort } from "../modules/auth.module.port";
import type { ClientApiV1 } from "./client-api.v1";
import { ClientBootstrapper } from "./client-bootstrapper";

export class ClientCompositionRoot {
	private readonly logService: ILogServicePort = new LogService();
	private readonly eventBus: IDomainEventBusPort = new EventBus();
	private readonly clock: IClockPort = new Clock();
	#playAtlasSSEClient: PlayAtlasSSEClient | null = null;

	get playAtlasSSEClient(): IPlayAtlasSSEClientPort {
		if (!this.#playAtlasSSEClient) throw new Error("Client composition root was not built!");
		return this.#playAtlasSSEClient;
	}

	constructor() {}

	buildAsync = async (): Promise<ClientApiV1> => {
		const infra: IClientInfraModulePort = new ClientInfraModule({
			logService: this.logService,
			schemas: [
				gameRepositorySchema,
				genreRepositorySchema,
				companyRepositorySchema,
				platformRepositorySchema,
				sessionIdRepositorySchema,
				completionStatusRepositorySchema,
				gameLibraryFilterRepositorySchema,
				gameClassificationRepositorySchema,
				gameVectorStoreSchema,
				gameSessionStoreSchema,
				gameRecommendationRecordStoreSchema,
			],
			clock: this.clock,
		});
		await infra.initializeAsync();

		const sessionIdMapper = new SessionIdMapper();
		const sessionIdRepository = new SessionIdRepository({
			dbSignal: infra.dbSignal,
			sessionIdMapper: sessionIdMapper,
		});
		const sessionIdProvider = new SessionIdProvider({
			sessionIdRepository,
			clock: this.clock,
		});

		const authHttpClient = new HttpClient({ url: window.origin });
		const authAuthenticatedHttpClient = new AuthenticatedHttpClient({
			httpClient: new HttpClient({ url: window.origin }),
			sessionIdProvider,
		});
		const auth: IAuthModulePort = new AuthModule({
			httpClient: authHttpClient,
			authenticatedHttpClient: authAuthenticatedHttpClient,
			dbSignal: infra.dbSignal,
			clock: this.clock,
			logService: this.logService,
			eventBus: this.eventBus,
			sessionIdProvider,
		});
		await auth.initializeAsync();

		const playAtlasHttpClient = new AuthenticatedHttpClient({
			httpClient: new HttpClient({ url: window.origin }),
			sessionIdProvider,
		});
		const playAtlasClient = new PlayAtlasClient({ httpClient: playAtlasHttpClient });
		const syncRunner = new SyncRunner({ clock: this.clock, syncState: infra.playAtlasSyncState });

		const gameSessionReadonlyStore = new GameSessionReadonlyStore({ dbSignal: infra.dbSignal });

		const gameLibrary: IClientGameLibraryModulePort = new ClientGameLibraryModule({
			dbSignal: infra.dbSignal,
			playAtlasClient,
			clock: this.clock,
			syncRunner,
			gameSessionReadonlyStore: gameSessionReadonlyStore,
			logService: this.logService,
		});
		await gameLibrary.initializeAsync();

		const gameSession: IClientGameSessionModulePort = new GameSessionModule({
			clock: this.clock,
			dbSignal: infra.dbSignal,
			logService: this.logService,
			playAtlasClient,
			syncRunner,
			gameSessionReadonlyStore,
			instancePreferenceModelInvalidation:
				gameLibrary.recommendationEngineModule.instancePreferenceModelService,
		});

		const synchronization = new SynchronizationModule({
			clock: this.clock,
			eventBus: this.eventBus,
			syncCompaniesFlow: gameLibrary.syncCompaniesFlow,
			syncCompletionStatusesFlow: gameLibrary.syncCompletionStatusesFlow,
			syncGameClassificationsFlow: gameLibrary.syncGameClassificationsFlow,
			syncGamesFlow: gameLibrary.syncGamesFlow,
			syncGenresFlow: gameLibrary.syncGenresFlow,
			syncPlatformsFlow: gameLibrary.syncPlatformsFlow,
			syncGameSessionsFlow: gameSession.syncGameSessionsFlow,
			instancePreferenceModelService:
				gameLibrary.recommendationEngineModule.instancePreferenceModelService,
			storageManager: infra.storageManager,
		});

		this.startLibrarySync({ auth, synchronization });
		this.setupDomainEventListeners({ auth, synchronization });

		this.#playAtlasSSEClient = new PlayAtlasSSEClient({
			logService: this.logService,
		});

		const bootstrapper = new ClientBootstrapper({
			modules: { infra, gameLibrary, auth, gameSession, synchronization },
			eventBus: this.eventBus,
			playAtlasEventHub: this.#playAtlasSSEClient,
		});
		return bootstrapper.bootstrap();
	};

	private startLibrarySync = (deps: {
		auth: IAuthModulePort;
		synchronization: ISynchronizationModulePort;
	}) => {
		if (deps.auth.hasSession()) {
			void deps.synchronization.syncManager.executeAsync();
		}
	};

	private setupDomainEventListeners = (deps: {
		auth: IAuthModulePort;
		synchronization: ISynchronizationModulePort;
	}) => {
		this.eventBus.on("login-successful", () => {
			this.startLibrarySync(deps);
		});
	};
}
