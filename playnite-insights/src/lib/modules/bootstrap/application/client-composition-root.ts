import { SessionIdMapper, SessionIdProvider } from "$lib/modules/auth/application";
import { SessionIdRepository, sessionIdRepositorySchema } from "$lib/modules/auth/infra";
import {
	AuthenticatedHttpClient,
	EventBus,
	HttpClient,
	LogServiceFactory,
	PlayAtlasSSEClient,
	type IClockPort,
	type IDomainEventBusPort,
	type IHttpClientPort,
	type ILogServiceFactory,
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
import { ProjectionReconciler } from "$lib/modules/synchronization/application/projection-reconciler";
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
import { RecommendationEngineModuleCompositor } from "../modules/game-library/composition";
import type { ClientApiV1 } from "./client-api.v1";
import { ClientBootstrapper } from "./client-bootstrapper";

export class ClientCompositionRoot {
	private readonly logServiceFactory: ILogServiceFactory;
	private readonly eventBus: IDomainEventBusPort;
	private readonly clock: IClockPort;
	#playAtlasSSEClient: PlayAtlasSSEClient | null = null;

	get playAtlasSSEClient(): IPlayAtlasSSEClientPort {
		if (!this.#playAtlasSSEClient) throw new Error("Client composition root was not built!");
		return this.#playAtlasSSEClient;
	}

	constructor() {
		this.eventBus = new EventBus();
		this.clock = new Clock();
		this.logServiceFactory = new LogServiceFactory({ clock: this.clock });
	}

	buildAsync = async (): Promise<ClientApiV1> => {
		const buildLogger = (context: string) => this.logServiceFactory.build(context);

		const infra: IClientInfraModulePort = new ClientInfraModule({
			logService: buildLogger("Infra"),
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

		const authHttpClient = this.buildHttpClient();
		const authAuthenticatedHttpClient = new AuthenticatedHttpClient({
			httpClient: this.buildHttpClient(),
			sessionIdProvider,
		});
		const auth: IAuthModulePort = new AuthModule({
			httpClient: authHttpClient,
			authenticatedHttpClient: authAuthenticatedHttpClient,
			dbSignal: infra.dbSignal,
			clock: this.clock,
			logService: buildLogger("AuthModule"),
			eventBus: this.eventBus,
			sessionIdProvider,
		});
		await auth.initializeAsync();

		const gameSessionReadonlyStore = new GameSessionReadonlyStore({ dbSignal: infra.dbSignal });

		const recommendationEngineParts = RecommendationEngineModuleCompositor.buildParts({
			dbSignal: infra.dbSignal,
			clock: this.clock,
			gameSessionReadonlyStore,
			logService: buildLogger("RecommendationEngineModuleCompositor"),
		});

		const {
			gameRecommendationRecordProjectionService,
			gameRecommendationRecordProjectionWriter,
			gameVectorProjectionService,
			gameVectorProjectionWriter,
			instancePreferenceModelInvalidation,
			instancePreferenceModelService,
		} = recommendationEngineParts;

		const projectionReconciler = new ProjectionReconciler({
			gameRecommendationRecordProjectionService,
			gameRecommendationRecordProjectionWriter,
			gameVectorProjectionService,
			gameVectorProjectionWriter,
			instancePreferenceModelInvalidation,
			logService: buildLogger("ProjectionReconciler"),
		});

		const playAtlasHttpClient = new AuthenticatedHttpClient({
			httpClient: this.buildHttpClient(),
			sessionIdProvider,
		});
		const playAtlasClient = new PlayAtlasClient({ httpClient: playAtlasHttpClient });
		const syncRunner = new SyncRunner({ clock: this.clock, syncState: infra.playAtlasSyncState });

		const gameLibrary: IClientGameLibraryModulePort = new ClientGameLibraryModule({
			dbSignal: infra.dbSignal,
			playAtlasClient,
			clock: this.clock,
			syncRunner,
			projectionInvalidator: projectionReconciler,
			gameRecommendationRecordProjectionService,
			gameVectorProjectionService,
			instancePreferenceModelService,
		});
		await gameLibrary.initializeAsync();

		const gameSession: IClientGameSessionModulePort = new GameSessionModule({
			clock: this.clock,
			dbSignal: infra.dbSignal,
			logService: buildLogger("GameSessionModule"),
			playAtlasClient,
			syncRunner,
			gameSessionReadonlyStore,
			instancePreferenceModelInvalidation,
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
			instancePreferenceModelService,
			storageManager: infra.storageManager,
			projectionCoordinator: projectionReconciler,
		});

		this.startLibrarySync({ auth, synchronization });
		this.setupDomainEventListeners({ auth, synchronization });

		this.#playAtlasSSEClient = new PlayAtlasSSEClient({
			logService: buildLogger("PlayAtlasSSEClient"),
		});

		const bootstrapper = new ClientBootstrapper({
			modules: { infra, gameLibrary, auth, gameSession, synchronization },
			eventBus: this.eventBus,
			playAtlasEventHub: this.#playAtlasSSEClient,
		});
		return bootstrapper.bootstrap();
	};

	private buildHttpClient = (): IHttpClientPort => {
		return new HttpClient({ url: window.origin });
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
