import type {
	IClassificationFactoryPort,
	IClassificationMapperPort,
	IClassificationTierCalibrationServicePort,
	ICompanyFactoryPort,
	ICompanyMapperPort,
	ICompletionStatusFactoryPort,
	ICompletionStatusMapperPort,
	IGameClassificationFactoryPort,
	IGameClassificationMapperPort,
	IGameClassificationScoreServicePort,
	IGameFactoryPort,
	IGameLibraryUnitOfWorkPort,
	IGameMapperPort,
	IGenreFactoryPort,
	IGenreMapperPort,
	IHorrorScoreEnginePort,
	IPlatformFactoryPort,
	IPlatformMapperPort,
	IRunBasedEvidenceExtractorPort,
	IRunBasedScoreEngine,
	IScoreBreakdownNormalizerPort,
	IScoreEngineRegistryPort,
	ITagFactoryPort,
	ITagMapperPort,
} from "@playatlas/game-library/application";
import type { IApplyDefaultClassificationsCommandHandlerPort } from "@playatlas/game-library/commands";
import type {
	IClassificationRepositoryPort,
	ICompanyRepositoryPort,
	ICompletionStatusRepositoryPort,
	IGameAssetsContextFactoryPort,
	IGameAssetsReindexerPort,
	IGameClassificationRepositoryPort,
	IGameRepositoryPort,
	IGenreRepositoryPort,
	IPlatformRepositoryPort,
	ITagRepositoryPort,
} from "@playatlas/game-library/infra";
import type {
	IGetAllClassificationsQueryHandler,
	IGetAllCompaniesQueryHandlerPort,
	IGetAllCompletionStatusesQueryHandlerPort,
	IGetAllGameClassificationsQueryHandlerPort,
	IGetAllGamesQueryHandlerPort,
	IGetAllGenresQueryHandlerPort,
	IGetAllPlatformsQueryHandlerPort,
	IGetAllTagsQueryHandlerPort,
} from "@playatlas/game-library/queries";

export type IGameLibraryModulePort = Readonly<{
	queries: {
		getGetAllGamesQueryHandler: () => IGetAllGamesQueryHandlerPort;
		getGetAllCompaniesQueryHandler: () => IGetAllCompaniesQueryHandlerPort;
		getGetAllPlatformsQueryHandler: () => IGetAllPlatformsQueryHandlerPort;
		getGetAllGenresQueryHandler: () => IGetAllGenresQueryHandlerPort;
		getGetAllCompletionStatusesQueryHandler: () => IGetAllCompletionStatusesQueryHandlerPort;
		getGetAllTagsQueryHandler: () => IGetAllTagsQueryHandlerPort;
	};

	getGameAssetsContextFactory: () => IGameAssetsContextFactoryPort;
	getGameAssetsReindexer: () => IGameAssetsReindexerPort;

	getGameMapper: () => IGameMapperPort;
	getGameFactory: () => IGameFactoryPort;
	getGameRepository: () => IGameRepositoryPort;

	getCompanyMapper: () => ICompanyMapperPort;
	getCompanyFactory: () => ICompanyFactoryPort;
	getCompanyRepository: () => ICompanyRepositoryPort;

	getCompletionStatusMapper: () => ICompletionStatusMapperPort;
	getCompletionStatusFactory: () => ICompletionStatusFactoryPort;
	getCompletionStatusRepository: () => ICompletionStatusRepositoryPort;

	getPlatformMapper: () => IPlatformMapperPort;
	getPlatformFactory: () => IPlatformFactoryPort;
	getPlatformRepository: () => IPlatformRepositoryPort;

	getGenreMapper: () => IGenreMapperPort;
	getGenreFactory: () => IGenreFactoryPort;
	getGenreRepository: () => IGenreRepositoryPort;

	getTagMapper: () => ITagMapperPort;
	getTagFactory: () => ITagFactoryPort;
	getTagRepository: () => ITagRepositoryPort;

	getGameLibraryUnitOfWork: () => IGameLibraryUnitOfWorkPort;

	scoreEngine: {
		queries: {
			getGetAllClassificationsQueryHandler: () => IGetAllClassificationsQueryHandler;
			getGetAllGameClassificationsQueryHandler: () => IGetAllGameClassificationsQueryHandlerPort;
		};

		commands: {
			getApplyDefaultClassificationsCommandHandler: () => IApplyDefaultClassificationsCommandHandlerPort;
		};

		evidenceExtractors: {
			getRunBasedEvidenceExtractor: () => IRunBasedEvidenceExtractorPort;
		};

		engines: {
			getRunBasedScoreEngine: () => IRunBasedScoreEngine;
			getHorrorScoreEngine: () => IHorrorScoreEnginePort;
		};

		getClassificationMapper: () => IClassificationMapperPort;
		getClassificationFactory: () => IClassificationFactoryPort;
		getClassificationRepository: () => IClassificationRepositoryPort;

		getGameClassificationMapper: () => IGameClassificationMapperPort;
		getGameClassificationFactory: () => IGameClassificationFactoryPort;
		getGameClassificationRepository: () => IGameClassificationRepositoryPort;
		getGameClassificationScoreService: () => IGameClassificationScoreServicePort;

		getScoreEngineRegistry: () => IScoreEngineRegistryPort;
		getScoreBreakdownNormalizer: () => IScoreBreakdownNormalizerPort;

		getClassificationTierCalibrationService: () => IClassificationTierCalibrationServicePort;
	};

	init: () => void;
}>;
