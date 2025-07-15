import * as fsAsync from 'fs/promises';
import * as fs from 'fs';
import { makePlayniteLibraryImporterService } from './playnite-library-importer/service';
import * as stream from 'stream';
import * as streamAsync from 'stream/promises';
import type { FileSystemAsyncDeps, StreamUtilsAsyncDeps } from './types';
import { makePlayniteLibrarySyncRepository } from '$lib/services/playnite-library-sync/repository';
import { makePlatformRepository } from '$lib/services/platform/repository';
import { makePlayniteGameRepository } from './playnite-game';
import { makeDeveloperRepository } from './developer/repository';
import { makeHomePageService } from './home-page/service';
import { makeDashPageService } from './dashboard-page/service';
import { makeGamePageService } from './game-page/service';
import { makeMediaFilesService } from './media-files/service';
import {
	getDb,
	makeFileSystemService,
	makeGenreRepository,
	makePublisherRepository,
	config
} from '@playnite-insights/infrastructure';
import {
	makeLogService,
	makeLibraryManifestService,
	LOG_LEVELS,
	isValidLogLevel
} from '@playnite-insights/services';

export const setupServices = () => {
	const fileSystemService = makeFileSystemService();
	const FsAsyncDeps: FileSystemAsyncDeps = {
		readdir: fsAsync.readdir,
		access: fsAsync.access,
		readfile: fsAsync.readFile,
		writeFile: fsAsync.writeFile,
		rm: fsAsync.rm,
		unlink: fsAsync.unlink,
		stat: fsAsync.stat,
		mkdir: fsAsync.mkdir,
		constants: fsAsync.constants
	};
	const streamUtilsAsyncDeps: StreamUtilsAsyncDeps = {
		readableFromWeb: stream.Readable.fromWeb,
		createWriteStream: fs.createWriteStream,
		pipeline: streamAsync.pipeline
	};
	const logLevel = Number(process.env.LOG_LEVEL);
	const logService = makeLogService(isValidLogLevel(logLevel) ? logLevel : LOG_LEVELS.info);
	const commonDeps = { getDb, logService, fileSystemService, ...config };
	// Repositories
	const publisherRepository = makePublisherRepository({ ...commonDeps });
	const platformRepository = makePlatformRepository({ ...commonDeps });
	const developerRepository = makeDeveloperRepository({ ...commonDeps });
	const genreRepository = makeGenreRepository({ ...commonDeps });
	const playniteGameRepository = makePlayniteGameRepository({
		...commonDeps,
		publisherRepository,
		platformRepository,
		developerRepository,
		genreRepository
	});
	const playniteLibrarySyncRepository = makePlayniteLibrarySyncRepository({
		...commonDeps
	});
	const repositories = {
		publisherRepository,
		platformRepository,
		developerRepository,
		playniteGameRepository,
		playniteLibrarySyncRepository,
		genreRepository
	};
	// Services
	const libraryManifestService = makeLibraryManifestService({
		...FsAsyncDeps,
		...commonDeps,
		getManifestData: playniteGameRepository.getManifestData
	});
	const playniteLibraryImporterService = makePlayniteLibraryImporterService({
		...FsAsyncDeps,
		...streamUtilsAsyncDeps,
		...commonDeps,
		...repositories,
		libraryManifestService: libraryManifestService
	});
	const homePageService = makeHomePageService({ ...commonDeps, ...repositories });
	const dashPageService = makeDashPageService({ ...commonDeps });
	const gamePageService = makeGamePageService({ ...commonDeps, ...repositories });
	const mediaFilesService = makeMediaFilesService({
		...FsAsyncDeps,
		...commonDeps
	});

	const services = {
		...repositories,
		log: logService,
		libraryManifest: libraryManifestService,
		playniteLibraryImporter: playniteLibraryImporterService,
		homePage: homePageService,
		dashPage: dashPageService,
		gamePage: gamePageService,
		mediaFiles: mediaFilesService,
		config
	};

	return { services };
};
