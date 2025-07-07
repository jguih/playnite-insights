import { makeLibraryManifestService } from '$lib/services/library-manifest';
import { makeLogService } from '$lib/services/log';
import { makePlayniteGameRepository } from '$lib/services/playnite-game';
import { constants } from 'fs/promises';
import { vi } from 'vitest';

export const createMocks = () => {
	const fsAsyncDeps = {
		access: vi.fn(),
		readdir: vi.fn(),
		readfile: vi.fn(),
		rm: vi.fn(),
		unlink: vi.fn(),
		writeFile: vi.fn(),
		stat: vi.fn(),
		constants: constants
	};
	const streamUtilsAsyncDeps = {
		readableFromWeb: vi.fn(),
		pipeline: vi.fn(),
		createWriteStream: vi.fn()
	};
	const logService = makeLogService();
	// Repositories
	const playniteLibrarySyncRepository = {
		getTotalPlaytimeOverLast6Months: vi.fn(),
		getTotalGamesOwnedOverLast6Months: vi.fn(),
		add: vi.fn()
	};
	const db = {
		prepare: () => {
			return { all: vi.fn(), get: vi.fn(), run: vi.fn() };
		}
	};
	const getDb = vi.fn().mockReturnValue(db);
	const playniteGameRepository = makePlayniteGameRepository({
		getDb: getDb,
		logService: logService
	});
	// Services
	const libraryManifestService = makeLibraryManifestService({
		...fsAsyncDeps,
		CONTENT_HASH_FILE_NAME: 'contentHash.txt',
		getManifestData: vi.fn(),
		FILES_DIR: '/files',
		MANIFEST_FILE: '/app/manifest.json',
		logService: logService
	});

	return {
		fsAsyncDeps,
		streamUtilsAsyncDeps,
		repository: {
			playniteLibrarySync: playniteLibrarySyncRepository,
			playniteGame: playniteGameRepository
		},
		services: { log: logService, libraryManifest: libraryManifestService },
		getDb
	};
};
