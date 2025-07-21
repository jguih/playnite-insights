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
	makeGameSessionService
} from '@playnite-insights/infra';
import {
	makeLibraryManifestService,
	makeMediaFilesService,
	makeDashPageService,
	makePlayniteLibraryImporterService
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
	const repositories = {
		platformRepository,
		companyRepository,
		playniteGameRepository,
		playniteLibrarySyncRepository,
		genreRepository
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
