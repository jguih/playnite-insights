import * as fsAsync from 'fs/promises';
import * as fs from 'fs';
import { makeLibraryManifestService } from './library-manifest';
import * as config from '../config/config';
import { makePlayniteLibraryImporterService } from './playnite-library-importer';
import * as stream from 'stream';
import * as streamAsync from 'stream/promises';
import AdmZip from 'adm-zip';
import type { FileSystemAsyncDeps, StreamUtilsAsyncDeps } from './types';
import { getDb } from '$lib/infrastructure/database';
import { makePlayniteLibrarySyncRepository } from '$lib/playnite-library-sync/playnite-library-sync-repository';
import { makePublisherRepository } from '$lib/publisher/publisher-repository';
import { makePlatformRepository } from '$lib/platform/platform-repository';
import { makeLogService } from './log';
import { makePlayniteGameRepository } from './playnite-game';

export const setupServices = () => {
	const FsAsyncDeps: FileSystemAsyncDeps = {
		readdir: fsAsync.readdir,
		access: fsAsync.access,
		readfile: fsAsync.readFile,
		writeFile: fsAsync.writeFile,
		rm: fsAsync.rm,
		unlink: fsAsync.unlink
	};
	const streamUtilsAsyncDeps: StreamUtilsAsyncDeps = {
		readableFromWeb: stream.Readable.fromWeb,
		createWriteStream: fs.createWriteStream,
		pipeline: streamAsync.pipeline
	};
	console.log('makeLogService', makeLogService);
	const logService = makeLogService();
	// Repositories
	const commonRepositoryDeps = { getDb, logService };
	const publisherRepository = makePublisherRepository({ ...commonRepositoryDeps });
	const platformRepository = makePlatformRepository({ ...commonRepositoryDeps });
	const playniteGameRepository = makePlayniteGameRepository({
		...commonRepositoryDeps,
		publisherRepository,
		platformRepository
	});
	const playniteLibrarySyncRepository = makePlayniteLibrarySyncRepository({
		...commonRepositoryDeps
	});
	// Services
	const libraryManifestService = makeLibraryManifestService({
		...FsAsyncDeps,
		getManifestData: playniteGameRepository.getManifestData,
		logService: logService,
		CONTENT_HASH_FILE_NAME: config.CONTENT_HASH_FILE_NAME,
		FILES_DIR: config.FILES_DIR,
		MANIFEST_FILE: config.LIBRARY_MANIFEST_FILE
	});
	const playniteLibraryImporterService = makePlayniteLibraryImporterService({
		...FsAsyncDeps,
		...streamUtilsAsyncDeps,
		playniteGameRepository: playniteGameRepository,
		libraryManifestService: libraryManifestService,
		playniteLibrarySyncRepository: playniteLibrarySyncRepository,
		logService: logService,
		FILES_DIR: config.FILES_DIR,
		TMP_DIR: config.TMP_DIR,
		createZip: (path) => new AdmZip(path)
	});
	const services = {
		log: logService,
		libraryManifest: libraryManifestService,
		playniteLibraryImporter: playniteLibraryImporterService
	};
	const repositories = {
		publisher: publisherRepository,
		platform: platformRepository,
		playniteGame: playniteGameRepository,
		playniteLibrarySync: playniteLibrarySyncRepository
	};
	return { services, repositories };
};
