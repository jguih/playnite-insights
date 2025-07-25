import {
	getDb,
	makeFileSystemService,
	makeGenreRepository,
	makePlatformRepository,
	makePlayniteLibrarySyncRepository,
	makePlayniteGameRepository,
	makeCompanyRepository,
	makeStreamUtilsService,
	defaultLogger,
	config,
	makeGameSessionRepository
} from '@playnite-insights/infra';
import {
	makeLibraryManifestService,
	makeMediaFilesService,
	makeDashPageService,
	makePlayniteLibraryImporterService,
	makeGameSessionService
} from '@playnite-insights/core';
import { getLastSixMonthsAbreviated } from '$lib/utils/date';

export const setupServices = () => {
	const fileSystemService = makeFileSystemService();
	const streamUtilsService = makeStreamUtilsService();
	// Repositories
	const platformRepository = makePlatformRepository();
	const companyRepository = makeCompanyRepository();
	const genreRepository = makeGenreRepository();
	const playniteGameRepository = makePlayniteGameRepository();
	const playniteLibrarySyncRepository = makePlayniteLibrarySyncRepository();
	const gameSessionRepository = makeGameSessionRepository();
	const repositories = {
		platformRepository,
		companyRepository,
		playniteGameRepository,
		playniteLibrarySyncRepository,
		genreRepository,
		gameSessionRepository
	};
	const commonDeps = {
		getDb,
		logService: defaultLogger,
		fileSystemService,
		streamUtilsService,
		...config,
		...repositories
	};
	// Services
	const libraryManifestService = makeLibraryManifestService({
		...commonDeps,
		getManifestData: playniteGameRepository.getManifestData
	});
	const playniteLibraryImporterService = makePlayniteLibraryImporterService({
		...commonDeps,
		...repositories,
		libraryManifestService: libraryManifestService
	});
	const dashPageService = makeDashPageService({
		...commonDeps,
		getLastSixMonthsAbv: getLastSixMonthsAbreviated
	});
	const mediaFilesService = makeMediaFilesService({ ...commonDeps });
	const gameSessionService = makeGameSessionService({ ...commonDeps });

	const services = {
		...repositories,
		log: defaultLogger,
		libraryManifest: libraryManifestService,
		playniteLibraryImporter: playniteLibraryImporterService,
		dashPage: dashPageService,
		mediaFiles: mediaFilesService,
		gameSession: gameSessionService,
		config
	};

	return { services };
};
