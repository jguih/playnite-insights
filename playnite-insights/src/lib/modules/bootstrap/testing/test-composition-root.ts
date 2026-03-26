import { SessionIdMapper, SessionIdProvider } from "$lib/modules/auth/application";
import { SessionIdRepository, sessionIdRepositorySchema } from "$lib/modules/auth/infra";
import {
	AuthenticatedHttpClient,
	EventBus,
	LogServiceFactory,
	PlayAtlasClient,
	type IDomainEventBusPort,
	type IHttpClientPort,
	type ILogServiceFactory,
	type ILogServicePort,
	type IPlayAtlasEventHubPort,
} from "$lib/modules/common/application";
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
import {
	CompanyFactory,
	CompletionStatusFactory,
	GameClassificationFactory,
	GameFactory,
	GameLibraryFilterQueryFactory,
	GenreFactory,
	PlatformFactory,
} from "$lib/modules/game-library/testing";
import { GameSessionReadonlyStore, gameSessionStoreSchema } from "$lib/modules/game-session/infra";
import { ProjectionReconciler } from "$lib/modules/synchronization/application/projection-reconciler";
import { SyncRunner } from "$lib/modules/synchronization/application/sync-runner";
import { type ClientApiV1 } from "../application/client-api.v1";
import { ClientBootstrapper } from "../application/client-bootstrapper";
import {
	GameSessionModule,
	SynchronizationModule,
	type IClientGameSessionModulePort,
} from "../modules";
import { AuthModule } from "../modules/auth.module";
import type { IAuthModulePort } from "../modules/auth.module.port";
import { RecommendationEngineModuleCompositor } from "../modules/game-library/composition";
import { ClientGameLibraryModule } from "../modules/game-library/game-library.module";
import type { IClientGameLibraryModulePort } from "../modules/game-library/game-library.module.port";
import type { IClientInfraModulePort } from "../modules/infra.module.port";
import { ClientInfraModule } from "../modules/infra.module.svelte";
import { TestClock, type ITestClockPort } from "./test-clock";

export class TestCompositionRoot {
	readonly mocks = {
		logService: {
			debug: vi.fn(),
			error: vi.fn(),
			info: vi.fn(),
			success: vi.fn(),
			warning: vi.fn(),
		} satisfies ILogServicePort,
		httpClient: {
			getAsync: vi.fn(),
			postAsync: vi.fn(),
			putAsync: vi.fn(),
			deleteAsync: vi.fn(),
		} satisfies IHttpClientPort,
		playAtlasEventHub: {
			subscribe: vi.fn(),
			unsubscribe: vi.fn(),
		} satisfies IPlayAtlasEventHubPort,
	};

	readonly factories = {
		game: new GameFactory(),
		genre: new GenreFactory(),
		company: new CompanyFactory(),
		platform: new PlatformFactory(),
		completionStatus: new CompletionStatusFactory(),
		gameLibraryFilterQuery: new GameLibraryFilterQueryFactory(),
		gameClassification: new GameClassificationFactory(),
	};

	private readonly logServiceFactory: ILogServiceFactory;
	readonly clock: ITestClockPort;
	private readonly eventBus: IDomainEventBusPort = new EventBus();

	constructor() {
		this.eventBus = new EventBus();
		this.clock = new TestClock();
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

		const authHttpClient = this.mocks.httpClient;
		const authAuthenticatedHttpClient = new AuthenticatedHttpClient({
			httpClient: this.mocks.httpClient,
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
			httpClient: this.mocks.httpClient,
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
			projectionInvalidator: projectionReconciler,
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

		const bootstrapper = new ClientBootstrapper({
			modules: { infra, gameLibrary, auth, gameSession, synchronization },
			eventBus: this.eventBus,
			playAtlasEventHub: this.mocks.playAtlasEventHub,
		});
		return bootstrapper.bootstrap();
	};

	cleanup = async (): Promise<void> => {
		const dbs = await indexedDB.databases();

		await Promise.all(
			dbs.map(
				(db) =>
					new Promise<void>((resolve) => {
						const req = indexedDB.deleteDatabase(db.name!);
						req.onsuccess = req.onerror = req.onblocked = () => resolve();
					}),
			),
		);
	};
}
