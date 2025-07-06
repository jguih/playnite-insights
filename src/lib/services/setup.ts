import * as fsAsync from 'fs/promises';
import * as fs from 'fs';
import { makeLibraryManifestService } from './library-manifest';
import { config } from '$lib/config';
import { makePlayniteLibraryImporterService } from './playnite-library-importer';
import * as stream from 'stream';
import * as streamAsync from 'stream/promises';
import AdmZip from 'adm-zip';
import type { FileSystemAsyncDeps, StreamUtilsAsyncDeps } from './types';
import { repositories } from '$lib/repositories';
import { makeLogService } from './log';
import { makePlayniteGameRepository } from '$lib/playnite-game/playnite-game-repository';
import { getDb } from '$lib/infrastructure/database';

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

export const logService = makeLogService();
export const playniteGameRepository = makePlayniteGameRepository({ getDb, logService });
export const libraryManifestService = makeLibraryManifestService({
	...FsAsyncDeps,
	getManifestData: playniteGameRepository.getManifestData,
	logService: logService,
	CONTENT_HASH_FILE_NAME: config.CONTENT_HASH_FILE_NAME,
	FILES_DIR: config.FILES_DIR,
	MANIFEST_FILE: config.LIBRARY_MANIFEST_FILE
});
export const playniteLibraryImporterService = makePlayniteLibraryImporterService({
	...FsAsyncDeps,
	...streamUtilsAsyncDeps,
	playniteGameRepository: playniteGameRepository,
	libraryManifestService: libraryManifestService,
	playniteLibrarySyncRepository: repositories.playniteLibrarySync,
	logService: logService,
	FILES_DIR: config.FILES_DIR,
	TMP_DIR: config.TMP_DIR,
	createZip: (path) => new AdmZip(path)
});
