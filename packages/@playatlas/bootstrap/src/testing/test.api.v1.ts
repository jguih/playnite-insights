import type {
	IRunBasedEvidenceExtractorPort,
	IScoreBreakdownNormalizerPort,
} from "@playatlas/game-library/application";
import type { IApplyDefaultClassificationsCommandHandlerPort } from "@playatlas/game-library/commands";
import type { ITestHorrorScoreEnginePort } from "@playatlas/game-library/testing";
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
			getHorrorScoreEngine: () => ITestHorrorScoreEnginePort;
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
};
