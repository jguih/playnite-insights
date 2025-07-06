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

export const libraryManifestService = makeLibraryManifestService({
	...FsAsyncDeps,
	getManifestData: repositories.playniteGame.getManifestData,
	CONTENT_HASH_FILE_NAME: config.CONTENT_HASH_FILE_NAME,
	FILES_DIR: config.FILES_DIR,
	MANIFEST_FILE: config.LIBRARY_MANIFEST_FILE
});

export const playniteLibraryImporterService = makePlayniteLibraryImporterService({
	...FsAsyncDeps,
	...streamUtilsAsyncDeps,
	playniteGameRepository: repositories.playniteGame,
	libraryManifestService: libraryManifestService,
	FILES_DIR: config.FILES_DIR,
	TMP_DIR: config.TMP_DIR,
	createZip: (path) => new AdmZip(path)
});

export const logService = makeLogService();
