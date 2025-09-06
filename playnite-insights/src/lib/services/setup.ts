import {
	getDb,
	makeFileSystemService,
	makeGenreRepository,
	makePlatformRepository,
	makePlayniteLibrarySyncRepository,
	makePlayniteGameRepository,
	makeCompanyRepository,
	makeStreamUtilsService,
	config,
	makeGameSessionRepository,
	makeLogService,
} from '@playnite-insights/infra';
import {
	makeLibraryManifestService,
	makeMediaFilesService,
	makeDashPageService,
	makePlayniteLibraryImporterService,
	makeGameSessionService,
} from '@playnite-insights/core';
import { getLastSixMonthsAbreviated } from '$lib/utils/date';

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
	const repositories = {
		platformRepository,
		companyRepository,
		playniteGameRepository,
		playniteLibrarySyncRepository,
		genreRepository,
		gameSessionRepository,
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
	const dashPageService = makeDashPageService({
		...commonDeps,
		getLastSixMonthsAbv: getLastSixMonthsAbreviated,
		logService: makeLogService('DashPageService'),
	});
	const mediaFilesService = makeMediaFilesService({
		...commonDeps,
		logService: makeLogService('MediaFilesService'),
	});
	const gameSessionService = makeGameSessionService({
		...commonDeps,
		logService: makeLogService('GameSessionService'),
	});

	const services = {
		...repositories,
		log: logService,
		libraryManifest: libraryManifestService,
		playniteLibraryImporter: playniteLibraryImporterService,
		dashPage: dashPageService,
		mediaFiles: mediaFilesService,
		gameSession: gameSessionService,
		config,
	};

	return { services };
};
