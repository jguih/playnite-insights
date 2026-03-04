import { SessionIdMapper, SessionIdProvider } from "$lib/modules/auth/application";
import { SessionIdRepository, sessionIdRepositorySchema } from "$lib/modules/auth/infra";
import {
	EventBus,
	PlayAtlasClient,
	type IDomainEventBusPort,
	type IHttpClientPort,
	type ILogServicePort,
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
import { ClientGameLibraryModule } from "../modules/game-library.module";
import type { IClientGameLibraryModulePort } from "../modules/game-library.module.port";
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

	readonly clock: ITestClockPort;

	private readonly eventBus: IDomainEventBusPort = new EventBus();

	constructor() {
		this.clock = new TestClock();
	}

	buildAsync = async (): Promise<ClientApiV1> => {
		const infra: IClientInfraModulePort = new ClientInfraModule({
			logService: this.mocks.logService,
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

		const auth: IAuthModulePort = new AuthModule({
			httpClient: this.mocks.httpClient,
			authenticatedHttpClient: this.mocks.httpClient,
			dbSignal: infra.dbSignal,
			clock: this.clock,
			logService: this.mocks.logService,
			eventBus: this.eventBus,
			sessionIdProvider,
		});
		await auth.initializeAsync();

		const playAtlasClient = new PlayAtlasClient({ httpClient: this.mocks.httpClient });
		const syncRunner = new SyncRunner({ clock: this.clock, syncState: infra.playAtlasSyncState });

		const gameSessionReadonlyStore = new GameSessionReadonlyStore({ dbSignal: infra.dbSignal });

		const gameLibrary: IClientGameLibraryModulePort = new ClientGameLibraryModule({
			dbSignal: infra.dbSignal,
			playAtlasClient,
			clock: this.clock,
			syncRunner,
			gameSessionReadonlyStore: gameSessionReadonlyStore,
		});
		await gameLibrary.initializeAsync();

		const gameSession: IClientGameSessionModulePort = new GameSessionModule({
			clock: this.clock,
			dbSignal: infra.dbSignal,
			logService: this.mocks.logService,
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

		const bootstrapper = new ClientBootstrapper({
			modules: { infra, gameLibrary, auth, gameSession, synchronization },
			eventBus: this.eventBus,
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
