import { makeEventBus } from "@playatlas/common/application";
import { makeClock, type AppEnvironmentVariables } from "@playatlas/common/infra";
import { makeLogServiceFactory } from "@playatlas/system/application";
import { bootstrapV1 } from "./bootstrap.service";
import {
	makeAuthModule,
	makeGameLibraryModule,
	makeJobQueueModule,
	makeSystemModule,
} from "./modules";
import { makeGameSessionModule } from "./modules/game-session.module";
import { makeInfraModule } from "./modules/infra.module";
import type { IInfraModulePort } from "./modules/infra.module.port";
import { makePlayniteIntegrationModule } from "./modules/playnite-integration.module";
import type { PlayAtlasApiV1 } from "./playatlas.api.v1";

export type AppCompositionRootDeps = {
	env: AppEnvironmentVariables;
};

export type AppRoot = {
	buildAsync: () => Promise<PlayAtlasApiV1>;
	/**
	 * Used for compatibility with old API.
	 * Will be removed with old API.
	 * @deprecated
	 */
	unsafe: {
		getInfra: () => IInfraModulePort;
	};
};

export const makeAppCompositionRoot = ({ env }: AppCompositionRootDeps): AppRoot => {
	let infra: IInfraModulePort;

	const _make_base_deps = () => {
		const system = makeSystemModule({ env });

		const logServiceFactory = makeLogServiceFactory({
			getCurrentLogLevel: () => system.getSystemConfig().getLogLevel(),
		});
		const logService = logServiceFactory.build("SvelteBackend");

		const eventBus = makeEventBus({
			logService: logServiceFactory.build("EventBus"),
		});

		const clock = makeClock();

		return { system, logServiceFactory, logService, eventBus, clock };
	};

	const buildAsync = async (): Promise<PlayAtlasApiV1> => {
		const { clock, eventBus, logService, logServiceFactory, system } = _make_base_deps();

		infra = makeInfraModule({
			logServiceFactory,
			envService: system.getEnvService(),
			systemConfig: system.getSystemConfig(),
		});
		await infra.initEnvironment();
		await infra.initDb();

		const baseDeps = { getDb: infra.getDb, logServiceFactory, eventBus, clock };

		const gameLibrary = makeGameLibraryModule({
			...baseDeps,
			fileSystemService: infra.getFsService(),
			systemConfig: system.getSystemConfig(),
		});
		gameLibrary.init();

		const playniteIntegration = makePlayniteIntegrationModule({
			...baseDeps,
			fileSystemService: infra.getFsService(),
			systemConfig: system.getSystemConfig(),
			gameRepository: gameLibrary.getGameRepository(),
			gameAssetsContextFactory: gameLibrary.getGameAssetsContextFactory(),
			gameLibraryUnitOfWork: gameLibrary.getGameLibraryUnitOfWork(),
		});
		await playniteIntegration.getLibraryManifestService().write();

		const auth = makeAuthModule({
			...baseDeps,
			signatureService: infra.getSignatureService(),
		});

		const gameSession = makeGameSessionModule({
			...baseDeps,
			gameRepository: gameLibrary.getGameRepository(),
		});

		const jobQueue = makeJobQueueModule({ ...baseDeps, jobDefinitions: [] });

		return bootstrapV1({
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
	};

	return {
		buildAsync,
		unsafe: {
			getInfra: () => infra,
		},
	};
};
