import {
	makeAuthService,
	makeExtensionRegistrationService,
	makeGameSessionService,
	makeLibraryManifestService,
	makeMediaFilesService,
	makePlayniteLibraryImporterService,
	makePlayniteLibraryService,
	makeSynchronizationService,
} from '@playnite-insights/core';
import {
	config,
	getDb as infraGetDb,
	makeLogService as infraMakeLogService,
	makeCompanyRepository,
	makeCompletionStatusRepository,
	makeCryptographyService,
	makeExtensionRegistrationRepository,
	makeFileSystemService,
	makeGameNoteRepository,
	makeGameSessionRepository,
	makeGenreRepository,
	makeImageRepository,
	makeInstanceAuthenticationRepository,
	makeInstanceSessionsRepository,
	makePlatformRepository,
	makePlayniteGameRepository,
	makePlayniteHostClient,
	makePlayniteLibraryMetricsRepository,
	makeSignatureService,
	makeStreamUtilsService,
	makeSynchronizationIdRepository,
	makeUploadService,
} from '@playnite-insights/infra';

export type ServerServicesDeps = {
	getDb?: typeof infraGetDb;
	makeLogService?: typeof infraMakeLogService;
};

export const makeServerServices = (deps: ServerServicesDeps = {}) => {
	const { getDb, makeLogService } = {
		getDb: infraGetDb,
		makeLogService: infraMakeLogService,
		...deps,
	};
	const fileSystemService = makeFileSystemService();
	const streamUtilsService = makeStreamUtilsService();
	const logService = makeLogService('SvelteBackend');
	// Repositories
	const platformRepository = makePlatformRepository({
		logService: makeLogService('PlatformRepository'),
		getDb,
	});
	const companyRepository = makeCompanyRepository({
		logService: makeLogService('CompanyRepository'),
		getDb,
	});
	const genreRepository = makeGenreRepository({
		logService: makeLogService('GenreRepository'),
		getDb,
	});
	const playniteGameRepository = makePlayniteGameRepository({
		logService: makeLogService('PlayniteGameRepository'),
		getDb,
	});
	const playniteLibraryMetricsRepository = makePlayniteLibraryMetricsRepository({
		logService: makeLogService('PlayniteLibraryMetricsRepository'),
		getDb,
	});
	const gameSessionRepository = makeGameSessionRepository({
		logService: makeLogService('GameSessionRepository'),
		getDb,
	});
	const gameNoteRepository = makeGameNoteRepository({
		logService: makeLogService('GameNoteRepository'),
		getDb,
	});
	const imageRepository = makeImageRepository({
		logService: makeLogService('ImageRepository'),
		getDb,
	});
	const completionStatusRepository = makeCompletionStatusRepository({
		logService: makeLogService('CompletionStatusRepository'),
		getDb,
	});
	const extensionRegistrationRepository = makeExtensionRegistrationRepository({
		logService: makeLogService('ExtensionRegistrationRepository'),
		getDb,
	});
	const instanceAuthenticationRepository = makeInstanceAuthenticationRepository({
		logService: makeLogService('InstanceAuthenticationRepository'),
		getDb,
	});
	const instanceSessionsRepository = makeInstanceSessionsRepository({
		logService: makeLogService('InstanceSessionsRepository'),
		getDb,
	});
	const synchronizationIdRepository = makeSynchronizationIdRepository({
		logService: makeLogService('SynchronizationRepository'),
		getDb,
	});
	const repositories = {
		platformRepository,
		companyRepository,
		playniteGameRepository,
		playniteLibraryMetricsRepository,
		genreRepository,
		gameSessionRepository,
		gameNoteRepository,
		imageRepository,
		completionStatusRepository,
		extensionRegistrationRepository,
		instanceAuthenticationRepository,
		instanceSessionsRepository,
		synchronizationIdRepository,
	};
	const commonDeps = {
		getDb,
		fileSystemService,
		streamUtilsService,
		...config,
		...repositories,
	};
	// Services
	const cryptographyService = makeCryptographyService({ ...commonDeps });
	const libraryManifestService = makeLibraryManifestService({
		...commonDeps,
		getManifestData: playniteGameRepository.getManifestData,
		logService: makeLogService('LibraryManifestService'),
	});
	const playniteLibraryImporterService = makePlayniteLibraryImporterService({
		...commonDeps,
		libraryManifestService: libraryManifestService,
		logService: makeLogService('PlayniteLibraryImporterService'),
	});
	const uploadService = makeUploadService({
		...commonDeps,
		logService: makeLogService('UploadService'),
	});
	const mediaFilesService = makeMediaFilesService({
		...commonDeps,
		...repositories,
		uploadService: uploadService,
		logService: makeLogService('MediaFilesService'),
	});
	const gameSessionService = makeGameSessionService({
		...commonDeps,
		logService: makeLogService('GameSessionService'),
	});
	const playniteLibraryService = makePlayniteLibraryService({
		...commonDeps,
		logService: makeLogService('PlayniteLibraryService'),
	});
	const signatureService = makeSignatureService({
		...commonDeps,
		logService: makeLogService('SignatureService'),
	});
	const extensionRegistrationService = makeExtensionRegistrationService({
		...commonDeps,
		logService: makeLogService('ExtensionRegistrationService'),
	});
	const authService = makeAuthService({
		...commonDeps,
		signatureService,
		logService: makeLogService('AuthService'),
		cryptographyService,
	});
	const synchronizationService = makeSynchronizationService({ ...commonDeps });
	const playniteHostHttpClient = makePlayniteHostClient({ ...commonDeps });

	const services = {
		logService,
		libraryManifestService,
		playniteLibraryImporterService,
		mediaFilesService,
		gameSessionService,
		playniteLibraryService,
		signatureService,
		extensionRegistrationService,
		authService,
		fileSystemService,
		synchronizationService,
		playniteHostHttpClient,
		config,
	};

	return { ...repositories, ...services };
};

export type ServerServices = ReturnType<typeof makeServerServices>;
