import * as fsAsync from 'fs/promises';
import * as fs from 'fs';
import { makePlayniteLibraryImporterService } from './playnite-library-importer/service';
import * as stream from 'stream';
import * as streamAsync from 'stream/promises';
import type { FileSystemAsyncDeps, StreamUtilsAsyncDeps } from './types';
import {
	getDb,
	makeFileSystemService,
	makeGenreRepository,
	makePublisherRepository,
	makePlatformRepository,
	makeDeveloperRepository,
	makePlayniteLibrarySyncRepository,
	makePlayniteGameRepository,
	defaultLogger,
	config
} from '@playnite-insights/infra';
import {
	makeLibraryManifestService,
	makeMediaFilesService,
	makeDashPageService,
	makeGamePageService,
	makeHomePageService
} from '@playnite-insights/core';
import { getLastSixMonthsAbreviated } from '$lib/utils/date';

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
		...config,
		...repositories
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
	const homePageService = makeHomePageService({ ...commonDeps });
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
		homePage: homePageService,
		dashPage: dashPageService,
		gamePage: gamePageService,
		mediaFiles: mediaFilesService,
		config
	};

	return { services };
};
