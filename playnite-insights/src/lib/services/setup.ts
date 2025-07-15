import * as fsAsync from 'fs/promises';
import * as fs from 'fs';
import { makePlayniteLibraryImporterService } from './playnite-library-importer/service';
import * as stream from 'stream';
import * as streamAsync from 'stream/promises';
import type { FileSystemAsyncDeps, StreamUtilsAsyncDeps } from './types';
import { makePlayniteGameRepository } from './playnite-game';
import { makeHomePageService } from './home-page/service';
import { makeDashPageService } from './dashboard-page/service';
import { makeGamePageService } from './game-page/service';
import {
	getDb,
	makeFileSystemService,
	makeGenreRepository,
	makePublisherRepository,
	makePlatformRepository,
	makeDeveloperRepository,
	makePlayniteLibrarySyncRepository,
	defaultLogger,
	config
} from '@playnite-insights/infra';
import { makeLibraryManifestService, makeMediaFilesService } from '@playnite-insights/core';

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
	const commonDeps = { getDb, logService: defaultLogger, fileSystemService, ...config };
	// Repositories
	const publisherRepository = makePublisherRepository();
	const platformRepository = makePlatformRepository();
	const developerRepository = makeDeveloperRepository();
	const genreRepository = makeGenreRepository();
	const playniteGameRepository = makePlayniteGameRepository({
		...commonDeps,
		publisherRepository,
		platformRepository,
		developerRepository,
		genreRepository
	});
	const playniteLibrarySyncRepository = makePlayniteLibrarySyncRepository();
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
	const mediaFilesService = makeMediaFilesService({ ...commonDeps });

	const services = {
		...repositories,
		log: defaultLogger,
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
