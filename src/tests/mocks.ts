import { makePlayniteGameRepository } from '$lib/playnite-game/playnite-game-repository';
import { makeLibraryManifestService } from '$lib/services/library-manifest';
import { makeLogService } from '$lib/services/log';
import { vi } from 'vitest';

export const createMocks = () => {
	const fsAsyncDeps = {
		access: vi.fn(),
		readdir: vi.fn(),
		readfile: vi.fn(),
		rm: vi.fn(),
		unlink: vi.fn(),
		writeFile: vi.fn()
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
		addPlayniteLibrarySync: vi.fn()
	};
	const playniteGameRepository = makePlayniteGameRepository({
		getDb: vi.fn(),
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
		services: { log: logService, libraryManifest: libraryManifestService }
	};
};
