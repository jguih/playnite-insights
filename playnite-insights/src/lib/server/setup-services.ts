import { makeGameRepository } from '@playatlas/game-library/infra';
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
	makePlayniteHostClient,
	makePlayniteLibraryMetricsRepository,
	makeSignatureService,
	makeStreamUtilsService,
	makeSynchronizationIdRepository,
	makeUploadService,
} from '@playnite-insights/infra';
import { DatabaseSync } from 'node:sqlite';
import { join } from 'path';

export type ServerServicesDeps = {
	getDb: () => DatabaseSync;
	env: {
		DATA_DIR: string;
		PLAYNITE_HOST_ADDRESS: string;
	};
	makeLogService?: typeof infraMakeLogService;
};

export const makeServerServices = (deps: ServerServicesDeps) => {
	const { getDb, makeLogService, env }: ServerServicesDeps = {
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
	const playniteGameRepository = makeGameRepository({
		logService: makeLogService('GameRepository'),
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
		// ...config,
		...repositories,
	};
	// Services
	const cryptographyService = makeCryptographyService({ ...commonDeps });
	const libraryManifestService = makeLibraryManifestService({
		...commonDeps,
		getManifestData: playniteGameRepository.getManifestData,
		logService: makeLogService('LibraryManifestService'),
		CONTENT_HASH_FILE_NAME: 'contentHash.txt',
		FILES_DIR: join(env.DATA_DIR, '/files'),
		LIBRARY_MANIFEST_FILE: join(env.DATA_DIR, '/manifest.json'),
	});
	const playniteLibraryImporterService = makePlayniteLibraryImporterService({
		...commonDeps,
		libraryManifestService: libraryManifestService,
		logService: makeLogService('PlayniteLibraryImporterService'),
		FILES_DIR: join(env.DATA_DIR, '/files'),
		TMP_DIR: join(env.DATA_DIR, '/tmp'),
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
		FILES_DIR: join(env.DATA_DIR, '/files'),
		SCREENSHOTS_DIR: join(env.DATA_DIR, '/upload', '/screenshots'),
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
		SECURITY_DIR: join(env.DATA_DIR, '/security'),
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
	const playniteHostHttpClient = makePlayniteHostClient({
		...commonDeps,
		signatureService,
		PLAYNITE_HOST_ADDRESS: env.PLAYNITE_HOST_ADDRESS,
	});

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
