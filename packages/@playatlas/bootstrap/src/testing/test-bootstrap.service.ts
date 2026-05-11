import type { IDomainEventBusPort, ILogServicePort } from "@playatlas/common/application";
import type { IJobQueueModulePort } from "../application/modules";
import type { IGameLibraryModulePort } from "../application/modules/game-library.module.port";
import type { ISeedDataModulePort } from "./modules/seed-data.module.port";
import type { ITestFactoryModulePort } from "./modules/test-factory.module";
import type { TestClock } from "./test-clock";
import type { PlayAtlasTestApiV1 } from "./test.api.v1";

export type BootstrapTestApiDeps = {
	modules: {
		gameLibrary: IGameLibraryModulePort;
		testFactory: ITestFactoryModulePort;
		seedData: ISeedDataModulePort;
		jobQueue: IJobQueueModulePort;
	};
	backendLogService: ILogServicePort;
	eventBus: IDomainEventBusPort;
	clock: TestClock;
};

export const bootstrapTestApiV1 = ({
	modules: { testFactory, gameLibrary, seedData, jobQueue },
	clock,
}: BootstrapTestApiDeps): PlayAtlasTestApiV1 => {
	const api: PlayAtlasTestApiV1 = {
		factory: testFactory,
		getClock: () => clock,
		gameLibrary: {
			commands: {
				getApplyDefaultClassificationsCommandHandler:
					gameLibrary.scoreEngine.commands.getApplyDefaultClassificationsCommandHandler,
			},
			scoreEngine: {
				getScoreBreakdownNormalizer: gameLibrary.scoreEngine.getScoreBreakdownNormalizer,
				evidenceExtractors: {
					getRunBasedEvidenceExtractor:
						gameLibrary.scoreEngine.evidenceExtractors.getRunBasedEvidenceExtractor,
				},
			},
		},
		data: {
			getGameRelationshipOptions: testFactory.getGameRelationshipOptions,
		},
		seed: seedData,
		jobQueue: {
			processNext: jobQueue.getJobProcessor().processNext,
		},
	};

	return Object.freeze(api);
};
