import type { IDomainEventBusPort, ILogServicePort } from "@playatlas/common/application";
import type { IGameLibraryModulePort } from "../application/modules/game-library.module.port";
import type { ISeedDataModulePort } from "./modules/seed-data.module.port";
import type { ITestFactoryModulePort } from "./modules/test-factory.module";
import type { TestClock } from "./test-clock";
import type { TestDoubleServices } from "./test.api.types";
import type { PlayAtlasTestApiV1 } from "./test.api.v1";

export type BootstrapTestApiDeps = {
	modules: {
		gameLibrary: IGameLibraryModulePort;
		testFactory: ITestFactoryModulePort;
		seedData: ISeedDataModulePort;
	};
	backendLogService: ILogServicePort;
	eventBus: IDomainEventBusPort;
	clock: TestClock;
	testDoubleServices: TestDoubleServices;
};

export const bootstrapTestApiV1 = ({
	modules: { testFactory, gameLibrary, seedData },
	clock,
	testDoubleServices,
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
				getHorrorScoreEngine: () => testDoubleServices.gameLibrary.scoreEngine.horror,
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
	};

	return Object.freeze(api);
};
