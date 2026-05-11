import {
	type IFileSystemServicePort,
	type ILogServiceFactoryPort,
} from "@playatlas/common/application";
import type { DbGetter, IClockPort, ISystemConfigPort } from "@playatlas/common/infra";
import {
	makeClassificationFactory,
	makeClassificationMapper,
	makeClassificationTierCalibrationService,
	makeCompanyFactory,
	makeCompanyMapper,
	makeCompletionStatusFactory,
	makeCompletionStatusMapper,
	makeGameClassificationFactory,
	makeGameClassificationMapper,
	makeGameClassificationScoreService,
	makeGameFactory,
	makeGameMapper,
	makeGenreFactory,
	makeGenreMapper,
	makeHorrorEvidenceExtractor,
	makeHorrorScoreEngine,
	makeHorrorScoringPolicy,
	makePlatformFactory,
	makePlatformMapper,
	makeRunBasedEvidenceExtractor,
	makeRunBasedScoreEngine,
	makeRunBasedScoringPolicy,
	makeScoreEngineDSL,
	makeScoreEngineRegistry,
	makeSurvivalScoreEngine,
	makeTagFactory,
	makeTagMapper,
	type IHorrorScoreEnginePort,
} from "@playatlas/game-library/application";
import { makeApplyDefaultClassificationsCommandHandler } from "@playatlas/game-library/commands";
import {
	makeClassificationRepository,
	makeCompanyRepository,
	makeCompletionStatusRepository,
	makeGameAssetsContextFactory,
	makeGameAssetsReindexer,
	makeGameClassificationRepository,
	makeGameLibraryUnitOfWork,
	makeGameRelationshipStore,
	makeGameRepository,
	makeGenreRepository,
	makePlatformRepository,
	makeScoreBreakdownNormalizer,
	makeTagRepository,
	type IGameRepositoryPort,
	type IGenreRepositoryPort,
	type ITagRepositoryPort,
} from "@playatlas/game-library/infra";
import {
	makeGetAllClassificationsQueryHandler,
	makeGetAllCompaniesQueryHandler,
	makeGetAllCompletionStatusesQueryHandler,
	makeGetAllGameClassificationsQueryHandler,
	makeGetAllGamesQueryHandler,
	makeGetAllGenresQueryHandler,
	makeGetAllPlatformQueryHandler,
	makeGetAllTagsQueryHandler,
} from "@playatlas/game-library/queries";
import type { IGameLibraryModulePort } from "./game-library.module.port";

export type GameLibraryModuleDeps = {
	getDb: DbGetter;
	logServiceFactory: ILogServiceFactoryPort;
	fileSystemService: IFileSystemServicePort;
	systemConfig: ISystemConfigPort;
	clock: IClockPort;
	scoreEngine?: {
		horrorEngine?: IHorrorScoreEnginePort;
	};
};

type GameLibraryScoreModuleDeps = GameLibraryModuleDeps & {
	genreRepository: IGenreRepositoryPort;
	gameRepository: IGameRepositoryPort;
	tagRepository: ITagRepositoryPort;
};

const makeGameLibraryScoreEngineModule = ({
	getDb,
	logServiceFactory,
	clock,
	fileSystemService,
	genreRepository,
	gameRepository,
	tagRepository,
	scoreEngine,
}: GameLibraryScoreModuleDeps): IGameLibraryModulePort["scoreEngine"] => {
	const buildLog = (ctx: string) => logServiceFactory.build(ctx);

	const scoreEngineDSL = makeScoreEngineDSL();

	const horrorEvidenceExtractor = makeHorrorEvidenceExtractor({ scoreEngineDSL });
	const horrorScoringPolicy = makeHorrorScoringPolicy();
	const horrorScoreEngine =
		scoreEngine?.horrorEngine ??
		makeHorrorScoreEngine({
			horrorEvidenceExtractor,
			horrorScoringPolicy,
		});

	const runBasedEvidenceExtractor = makeRunBasedEvidenceExtractor({ scoreEngineDSL });
	const runBasedScoringPolicy = makeRunBasedScoringPolicy();
	const runBasedScoreEngine = makeRunBasedScoreEngine({
		runBasedEvidenceExtractor,
		runBasedScoringPolicy,
	});

	const survivalScoreEngine = makeSurvivalScoreEngine();

	const scoreEngineRegistry = makeScoreEngineRegistry({
		horrorScoreEngine,
		runBasedScoreEngine,
		survivalScoreEngine,
	});

	const scoreBreakdownNormalizer = makeScoreBreakdownNormalizer({
		logService: buildLog("ScoreBreakdownNormalizer"),
	});

	const classificationFactory = makeClassificationFactory({ clock });
	const classificationMapper = makeClassificationMapper({ classificationFactory });
	const classificationRepository = makeClassificationRepository({
		classificationMapper,
		getDb,
		logService: buildLog("ClassificationRepository"),
	});
	const applyDefaultClassificationsCommandHandler = makeApplyDefaultClassificationsCommandHandler({
		classificationFactory,
		classificationRepository,
		logService: buildLog("ApplyDefaultClassificationsCommandHandler"),
	});
	const getAllClassificationsQueryHandler = makeGetAllClassificationsQueryHandler({
		classificationRepository,
		classificationMapper,
		logService: buildLog("GetAllClassificationsQueryHandler"),
		clock,
	});

	const gameClassificationFactory = makeGameClassificationFactory({ clock });
	const gameClassificationMapper = makeGameClassificationMapper({
		gameClassificationFactory,
		scoreBreakdownNormalizer,
		scoreEngineRegistry,
	});
	const gameClassificationRepository = makeGameClassificationRepository({
		gameClassificationMapper,
		getDb,
		logService: buildLog("GameClassificationRepository"),
	});
	const gameClassificationScoreService = makeGameClassificationScoreService({
		gameClassificationFactory,
		gameClassificationRepository,
		gameRepository,
		genreRepository,
		tagRepository,
		clock,
		scoreEngineRegistry,
		logService: buildLog("GameClassificationScoreService"),
	});
	const getAllGameClassificationsQueryHandler = makeGetAllGameClassificationsQueryHandler({
		gameClassificationRepository,
		gameClassificationMapper,
		clock,
		logService: buildLog("GetAllGameClassificationsQueryHandler"),
	});

	const classificationTierCalibrationService = makeClassificationTierCalibrationService({
		gameRepository,
		genreRepository,
		tagRepository,
		scoreEngineRegistry,
		fileSystemService,
		logService: buildLog("ClassificationTierCalibrationService"),
	});

	return {
		queries: {
			getGetAllClassificationsQueryHandler: () => getAllClassificationsQueryHandler,
			getGetAllGameClassificationsQueryHandler: () => getAllGameClassificationsQueryHandler,
		},

		commands: {
			getApplyDefaultClassificationsCommandHandler: () => applyDefaultClassificationsCommandHandler,
		},

		evidenceExtractors: {
			getRunBasedEvidenceExtractor: () => runBasedEvidenceExtractor,
		},

		engines: {
			getRunBasedScoreEngine: () => runBasedScoreEngine,
			getHorrorScoreEngine: () => horrorScoreEngine,
		},

		getClassificationMapper: () => classificationMapper,
		getClassificationFactory: () => classificationFactory,
		getClassificationRepository: () => classificationRepository,

		getGameClassificationMapper: () => gameClassificationMapper,
		getGameClassificationFactory: () => gameClassificationFactory,
		getGameClassificationRepository: () => gameClassificationRepository,
		getGameClassificationScoreService: () => gameClassificationScoreService,

		getScoreEngineRegistry: () => scoreEngineRegistry,
		getScoreBreakdownNormalizer: () => scoreBreakdownNormalizer,

		getClassificationTierCalibrationService: () => classificationTierCalibrationService,
	};
};

export const makeGameLibraryModule = (deps: GameLibraryModuleDeps): IGameLibraryModulePort => {
	const { getDb, logServiceFactory, fileSystemService, systemConfig, clock } = deps;
	const buildLog = (ctx: string) => logServiceFactory.build(ctx);

	const gameFactory = makeGameFactory({ clock });
	const gameMapper = makeGameMapper({ gameFactory });
	const relationshipStore = makeGameRelationshipStore({ getDb });
	const gameRepository = makeGameRepository({
		getDb,
		logService: buildLog("GameRepository"),
		gameMapper,
		relationshipStore,
	});
	const queryHandlerGetAllGames = makeGetAllGamesQueryHandler({
		gameRepository,
		gameMapper,
		clock,
		logService: buildLog("GetAllGamesQueryHandler"),
	});

	const companyFactory = makeCompanyFactory({ clock });
	const companyMapper = makeCompanyMapper({ companyFactory: companyFactory });
	const companyRepository = makeCompanyRepository({
		getDb,
		logService: buildLog("CompanyRepository"),
		companyMapper,
	});
	const queryHandlerGetAllCompanies = makeGetAllCompaniesQueryHandler({
		companyRepository,
		companyMapper,
		clock,
		logService: buildLog("GetAllCompaniesQueryHandler"),
	});

	const completionStatusFactory = makeCompletionStatusFactory({ clock });
	const completionStatusMapper = makeCompletionStatusMapper({ completionStatusFactory });
	const completionStatusRepository = makeCompletionStatusRepository({
		getDb,
		logService: buildLog("CompletionStatusRepository"),
		completionStatusMapper,
	});
	const queryHandlerGetAllCompletionStatuses = makeGetAllCompletionStatusesQueryHandler({
		completionStatusMapper,
		completionStatusRepository,
		clock,
		logService: buildLog("GetAllCompletionStatusesQueryHandler"),
	});

	const platformFactory = makePlatformFactory({ clock });
	const platformMapper = makePlatformMapper({ platformFactory });
	const platformRepository = makePlatformRepository({
		getDb,
		logService: buildLog("PlatformRepository"),
		platformMapper,
	});
	const queryHandlerGetAllPlatforms = makeGetAllPlatformQueryHandler({
		platformRepository,
		platformMapper,
		logService: buildLog("GetAllPlatformsQueryHandler"),
		clock,
	});

	const genreFactory = makeGenreFactory({ clock });
	const genreMapper = makeGenreMapper({ genreFactory });
	const genreRepository = makeGenreRepository({
		getDb,
		logService: buildLog("GenreRepository"),
		genreMapper,
	});
	const queryHandlerGetAllGenres = makeGetAllGenresQueryHandler({
		genreRepository,
		genreMapper,
		logService: buildLog("GetAllGenresQueryHandler"),
		clock,
	});

	const tagFactory = makeTagFactory({ clock });
	const tagMapper = makeTagMapper({ tagFactory });
	const tagRepository = makeTagRepository({
		getDb,
		logService: buildLog("TagRepository"),
		tagMapper,
	});
	const queryHandlerGetAllTags = makeGetAllTagsQueryHandler({
		clock,
		tagMapper,
		tagRepository,
		logService: buildLog("GetAllTagsQueryHandler"),
	});

	const gameAssetsContextFactory = makeGameAssetsContextFactory({
		fileSystemService,
		logServiceFactory,
		systemConfig,
	});
	const gameAssetsReindexer = makeGameAssetsReindexer({
		fileSystemService,
		gameAssetsContextFactory,
		gameRepository,
		logService: buildLog("GameAssetsReindexer"),
	});

	const scoreEngine = makeGameLibraryScoreEngineModule({
		...deps,
		genreRepository,
		gameRepository,
		tagRepository,
	});

	const gameLibraryUnitOfWork = makeGameLibraryUnitOfWork({
		companyFactory,
		companyRepository,
		completionStatusFactory,
		completionStatusRepository,
		genreFactory,
		genreRepository,
		gameFactory,
		gameRepository,
		platformFactory,
		platformRepository,
		tagRepository,
		tagFactory,
		gameClassificationScoreService: scoreEngine.getGameClassificationScoreService(),
		getDb,
	});

	const gameLibrary: IGameLibraryModulePort = {
		queries: {
			getGetAllGamesQueryHandler: () => queryHandlerGetAllGames,
			getGetAllCompaniesQueryHandler: () => queryHandlerGetAllCompanies,
			getGetAllPlatformsQueryHandler: () => queryHandlerGetAllPlatforms,
			getGetAllGenresQueryHandler: () => queryHandlerGetAllGenres,
			getGetAllCompletionStatusesQueryHandler: () => queryHandlerGetAllCompletionStatuses,
			getGetAllTagsQueryHandler: () => queryHandlerGetAllTags,
		},

		getGameAssetsContextFactory: () => gameAssetsContextFactory,
		getGameAssetsReindexer: () => gameAssetsReindexer,

		getGameFactory: () => gameFactory,
		getGameMapper: () => gameMapper,
		getGameRepository: () => gameRepository,

		getCompanyFactory: () => companyFactory,
		getCompanyMapper: () => companyMapper,
		getCompanyRepository: () => companyRepository,

		getCompletionStatusFactory: () => completionStatusFactory,
		getCompletionStatusMapper: () => completionStatusMapper,
		getCompletionStatusRepository: () => completionStatusRepository,

		getPlatformFactory: () => platformFactory,
		getPlatformMapper: () => platformMapper,
		getPlatformRepository: () => platformRepository,

		getGenreFactory: () => genreFactory,
		getGenreMapper: () => genreMapper,
		getGenreRepository: () => genreRepository,

		getTagFactory: () => tagFactory,
		getTagMapper: () => tagMapper,
		getTagRepository: () => tagRepository,

		getGameLibraryUnitOfWork: () => gameLibraryUnitOfWork,

		scoreEngine,

		init: () => {
			scoreEngine.getGameClassificationRepository().cleanup();
			scoreEngine.getClassificationRepository().cleanup();

			scoreEngine.commands
				.getApplyDefaultClassificationsCommandHandler()
				.execute({ type: "default" });
		},
	};
	return Object.freeze(gameLibrary);
};
