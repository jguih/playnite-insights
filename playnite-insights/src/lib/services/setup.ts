import {
	getDb,
	makeFileSystemService,
	makeGenreRepository,
	makePublisherRepository,
	makePlatformRepository,
	makeDeveloperRepository,
	makePlayniteLibrarySyncRepository,
	makePlayniteGameRepository,
	makeStreamUtilsService,
	defaultLogger,
	config
} from '@playnite-insights/infra';
import {
	makeLibraryManifestService,
	makeMediaFilesService,
	makeDashPageService,
	makeGamePageService,
	makePlayniteLibraryImporterService
} from '@playnite-insights/core';
import { getLastSixMonthsAbreviated } from '$lib/utils/date';

export const setupServices = () => {
	const fileSystemService = makeFileSystemService();
	const streamUtilsService = makeStreamUtilsService();
	// Repositories
	const publisherRepository = makePublisherRepository();
	const platformRepository = makePlatformRepository();
	const developerRepository = makeDeveloperRepository();
	const genreRepository = makeGenreRepository();
	const playniteGameRepository = makePlayniteGameRepository();
	const playniteLibrarySyncRepository = makePlayniteLibrarySyncRepository();
	const repositories = {
		publisherRepository,
		platformRepository,
		developerRepository,
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
	const gamePageService = makeGamePageService({ ...commonDeps });
	const mediaFilesService = makeMediaFilesService({ ...commonDeps });

	const services = {
		...repositories,
		log: defaultLogger,
		libraryManifest: libraryManifestService,
		playniteLibraryImporter: playniteLibraryImporterService,
		dashPage: dashPageService,
		gamePage: gamePageService,
		mediaFiles: mediaFilesService,
		config
	};

	return { services };
};
