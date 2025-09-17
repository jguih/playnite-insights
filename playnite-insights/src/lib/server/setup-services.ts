import {
	makeGameSessionService,
	makeLibraryManifestService,
	makeMediaFilesService,
	makePlayniteLibraryImporterService,
	makePlayniteLibraryService,
} from '@playnite-insights/core';
import {
	config,
	getDb,
	makeCompanyRepository,
	makeFileSystemService,
	makeGameNoteRepository,
	makeGameSessionRepository,
	makeGenreRepository,
	makeImageRepository,
	makeLogService,
	makePlatformRepository,
	makePlayniteGameRepository,
	makePlayniteHostClient,
	makePlayniteLibrarySyncRepository,
	makeSignatureService,
	makeStreamUtilsService,
	makeUploadService,
} from '@playnite-insights/infra';

export const setupServices = () => {
	const fileSystemService = makeFileSystemService();
	const streamUtilsService = makeStreamUtilsService();
	const logService = makeLogService('SvelteBackend');
	// Repositories
	const platformRepository = makePlatformRepository({
		logService: makeLogService('PlatformRepository'),
	});
	const companyRepository = makeCompanyRepository({
		logService: makeLogService('CompanyRepository'),
	});
	const genreRepository = makeGenreRepository({ logService: makeLogService('GenreRepository') });
	const playniteGameRepository = makePlayniteGameRepository({
		logService: makeLogService('PlayniteGameRepository'),
	});
	const playniteLibrarySyncRepository = makePlayniteLibrarySyncRepository({
		logService: makeLogService('PlayniteLibrarySyncRepository'),
	});
	const gameSessionRepository = makeGameSessionRepository({
		logService: makeLogService('GameSessionRepository'),
	});
	const noteRepository = makeGameNoteRepository({
		logService: makeLogService('GameNoteRepository'),
	});
	const imageRepository = makeImageRepository({ logService: makeLogService('ImageRepository') });
	const repositories = {
		platformRepository,
		companyRepository,
		playniteGameRepository,
		playniteLibrarySyncRepository,
		genreRepository,
		gameSessionRepository,
		noteRepository,
		imageRepository,
	};
	const commonDeps = {
		getDb,
		fileSystemService,
		streamUtilsService,
		...config,
		...repositories,
	};
	// Services
	const libraryManifestService = makeLibraryManifestService({
		...commonDeps,
		getManifestData: playniteGameRepository.getManifestData,
		logService: makeLogService('LibraryManifestService'),
	});
	const playniteLibraryImporterService = makePlayniteLibraryImporterService({
		...commonDeps,
		...repositories,
		libraryManifestService: libraryManifestService,
		logService: makeLogService('PlayniteLibraryImporterService'),
	});
	const uploadService = makeUploadService({
		...commonDeps,
		...repositories,
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
	const playniteHostHttpClient = makePlayniteHostClient({ ...commonDeps });

	const services = {
		...repositories,
		log: logService,
		libraryManifest: libraryManifestService,
		playniteLibraryImporter: playniteLibraryImporterService,
		mediaFiles: mediaFilesService,
		gameSession: gameSessionService,
		playniteLibrary: playniteLibraryService,
		signature: signatureService,
		playniteHostHttpClient,
		config,
	};

	return { services };
};
