import type {
	IRunBasedEvidenceExtractorPort,
	IScoreBreakdownNormalizerPort,
} from "@playatlas/game-library/application";
import type { IApplyDefaultClassificationsCommandHandlerPort } from "@playatlas/game-library/commands";
import type { JobProcessResult } from "@playatlas/job-queue/application";
import type { ISeedDataModulePort } from "./modules/seed-data.module.port";
import type { ITestFactoryModulePort } from "./modules/test-factory.module";
import type { TestClock } from "./test-clock";
import type { GameRelationshipOptions } from "./test.api.types";

export type PlayAtlasTestApiV1 = {
	getClock: () => TestClock;
	gameLibrary: {
		commands: {
			getApplyDefaultClassificationsCommandHandler: () => IApplyDefaultClassificationsCommandHandlerPort;
		};
		scoreEngine: {
			getScoreBreakdownNormalizer: () => IScoreBreakdownNormalizerPort;
			evidenceExtractors: {
				getRunBasedEvidenceExtractor: () => IRunBasedEvidenceExtractorPort;
			};
		};
	};
	factory: ITestFactoryModulePort;
	seed: ISeedDataModulePort;
	data: {
		getGameRelationshipOptions: () => GameRelationshipOptions;
	};
	jobQueue: {
		processNext: () => JobProcessResult;
	};
};
