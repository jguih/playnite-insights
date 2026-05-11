import { makeEventBus } from "@playatlas/common/application";
import type { AppEnvironmentVariables } from "@playatlas/common/infra";
import { makeLogServiceFactory } from "@playatlas/system/application";
import { bootstrapV1 } from "../application";
import { makeAuthModule, makeJobQueueModule, makeSystemModule } from "../application/modules";
import { makeGameSessionModule } from "../application/modules/game-session.module";
import { makeInfraModule } from "../application/modules/infra.module";
import { makePlayniteIntegrationModule } from "../application/modules/playnite-integration.module";
import { makeTestGameLibraryModule } from "./modules";
import { makeSeedDataModule } from "./modules/seed-data.module";
import { makeTestFactoryModule } from "./modules/test-factory.module";
import { bootstrapTestApiV1 } from "./test-bootstrap.service";
import { makeTestClock } from "./test-clock";
import type {
	TestCompositionRootBuildDeps,
	TestCompositionRootBuildResult,
} from "./test-composition-root.types";

export type TestCompositionRootDeps = {
	env: AppEnvironmentVariables;
};

export type ITestCompositionRootPort = {
	buildAsync: (deps: TestCompositionRootBuildDeps) => Promise<TestCompositionRootBuildResult>;
};

export const makeTestCompositionRoot = ({
	env,
}: TestCompositionRootDeps): ITestCompositionRootPort => {
	const _build_base_deps = () => {
		const system = makeSystemModule({ env });

		const logServiceFactory = makeLogServiceFactory({
			getCurrentLogLevel: () => system.getSystemConfig().getLogLevel(),
		});
		const logService = logServiceFactory.build("SvelteBackend");

		const eventBus = makeEventBus({
			logService: logServiceFactory.build("EventBus"),
		});

		const clock = makeTestClock();

		return { system, logServiceFactory, logService, eventBus, clock };
	};

	const buildAsync: ITestCompositionRootPort["buildAsync"] = async ({
		jobDefinitions,
		testDoubles,
	}) => {
		const { clock, eventBus, logService, logServiceFactory, system } = _build_base_deps();

		const infra = makeInfraModule({
			logServiceFactory,
			envService: system.getEnvService(),
			systemConfig: system.getSystemConfig(),
		});
		await infra.initEnvironment();
		await infra.initDb();

		const baseDeps = { getDb: infra.getDb, logServiceFactory, eventBus, clock };

		const gameLibrary = makeTestGameLibraryModule({
			...baseDeps,
			fileSystemService: infra.getFsService(),
			systemConfig: system.getSystemConfig(),
			horrorEngine: testDoubles?.scoreEngine?.horrorEngine,
		});

		const auth = makeAuthModule({
			...baseDeps,
			signatureService: infra.getSignatureService(),
		});

		const testFactory = makeTestFactoryModule({
			companyFactory: gameLibrary.getCompanyFactory(),
			completionStatusFactory: gameLibrary.getCompletionStatusFactory(),
			platformFactory: gameLibrary.getPlatformFactory(),
			genreFactory: gameLibrary.getGenreFactory(),
			tagFactory: gameLibrary.getTagFactory(),
			extensionRegistrationFactory: auth.getExtensionRegistrationFactory(),
			clock,
			gameFactory: gameLibrary.getGameFactory(),
			gameMapper: gameLibrary.getGameMapper(),
		});
		testFactory.init();

		const playniteIntegration = makePlayniteIntegrationModule({
			...baseDeps,
			fileSystemService: infra.getFsService(),
			systemConfig: system.getSystemConfig(),
			gameRepository: gameLibrary.getGameRepository(),
			gameAssetsContextFactory: gameLibrary.getGameAssetsContextFactory(),
			gameLibraryUnitOfWork: gameLibrary.getGameLibraryUnitOfWork(),
		});
		await playniteIntegration.getLibraryManifestService().write();

		const gameSession = makeGameSessionModule({
			...baseDeps,
			gameRepository: gameLibrary.getGameRepository(),
		});

		const jobQueue = makeJobQueueModule({ ...baseDeps, jobDefinitions });

		const seedData = makeSeedDataModule({ gameLibrary });

		const api = bootstrapV1({
			backendLogService: logService,
			eventBus,
			modules: {
				auth,
				gameLibrary,
				gameSession,
				infra,
				playniteIntegration,
				system,
				jobQueue,
			},
		});

		const testApi = bootstrapTestApiV1({
			backendLogService: logService,
			eventBus,
			modules: {
				gameLibrary,
				seedData,
				testFactory,
				jobQueue,
			},
			clock,
		});

		return { api, testApi };
	};

	return {
		buildAsync,
	};
};
