import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMock } from '../../tests/mocks';
import type z from 'zod';
import { makePlayniteLibraryImporterService } from './playnite-library-importer';
import { makeLogService } from './log';
import { join } from 'path';

vi.mock('$lib/infrastructure/database', () => ({}));

const createDeps = () => {
	const mocks = createMock();
	const fsMocks = mocks.fsAsyncDeps();
	const streamUtilsMocks = mocks.streamUtilsAsyncDeps();
	const playniteGameRepository = mocks.repository.playniteGame();
	const playniteLibrarySyncRepository = mocks.repository.playniteLibrarySync();
	const libraryManifestService = mocks.service.libraryManifest();
	return {
		...fsMocks,
		...streamUtilsMocks,
		playniteGameRepository: playniteGameRepository,
		libraryManifestService: libraryManifestService,
		logService: makeLogService(),
		playniteLibrarySyncRepository: playniteLibrarySyncRepository,
		FILES_DIR: '/files_dir',
		TMP_DIR: '/tmp',
		createZip: vi.fn(),
		getManifestData: vi.fn()
	};
};
let deps: ReturnType<typeof createDeps>;
let service: ReturnType<typeof makePlayniteLibraryImporterService>;

describe('Game Importer', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		deps = createDeps();
		service = makePlayniteLibraryImporterService(deps);
	});

	it('should return error when importing invalid json body', async () => {
		// Arrange
		const invalidJson = { invalid: 'data' } as unknown as z.infer<
			typeof service.syncGameListCommandSchema
		>;
		// Act
		const result = await service.sync(invalidJson);
		// Assert
		expect(result).toBe(false);
	});

	it('should check if a game exists before trying to add it', async () => {
		// Arrange
		const data: z.infer<typeof service.syncGameListCommandSchema> = {
			AddedItems: [{ Id: 'id1', Playtime: 12, ContentHash: 'hash', IsInstalled: false }],
			RemovedItems: [],
			UpdatedItems: []
		};
		deps.playniteGameRepository.exists.mockReturnValueOnce(true);
		// Act
		const result = await service.sync(data);
		// Assert
		expect(deps.playniteGameRepository.add).not.toHaveBeenCalled();
		expect(result).toBeTruthy();
	});

	it('should add a game if it doesnt exist', async () => {
		// Arrange
		const data: z.infer<typeof service.syncGameListCommandSchema> = {
			AddedItems: [{ Id: 'id1', Playtime: 12, ContentHash: 'hash', IsInstalled: false }],
			RemovedItems: [],
			UpdatedItems: []
		};
		deps.playniteGameRepository.exists.mockReturnValueOnce(false);
		// Act
		const result = await service.sync(data);
		// Assert
		expect(deps.playniteGameRepository.add).toHaveBeenCalled();
		expect(result).toBeTruthy();
	});

	it('should not update game if it doesnt exist', async () => {
		// Arrange
		const data: z.infer<typeof service.syncGameListCommandSchema> = {
			AddedItems: [],
			RemovedItems: [],
			UpdatedItems: [{ Id: 'id1', Playtime: 12, ContentHash: 'hash', IsInstalled: false }]
		};
		deps.playniteGameRepository.exists.mockReturnValueOnce(false);
		// Act
		const result = await service.sync(data);
		// Assert
		expect(deps.playniteGameRepository.update).not.toHaveBeenCalled();
		expect(result).toBeTruthy();
	});

	it('should update a game if it exists', async () => {
		// Arrange
		const data: z.infer<typeof service.syncGameListCommandSchema> = {
			AddedItems: [],
			RemovedItems: [],
			UpdatedItems: [{ Id: 'id1', Playtime: 12, ContentHash: 'hash', IsInstalled: false }]
		};
		deps.playniteGameRepository.exists.mockReturnValueOnce(true);
		// Act
		const result = await service.sync(data);
		// Assert
		expect(deps.playniteGameRepository.update).toHaveBeenCalled();
		expect(result).toBeTruthy();
	});

	it('should delete a game and its media folder', async () => {
		// Arrange
		const data: z.infer<typeof service.syncGameListCommandSchema> = {
			AddedItems: [],
			RemovedItems: ['id1'],
			UpdatedItems: []
		};
		deps.playniteGameRepository.remove.mockReturnValueOnce(true);
		// Act
		const result = await service.sync(data);
		// Assert
		expect(deps.rm).toHaveBeenCalledWith(join(deps.FILES_DIR, 'id1'), expect.anything());
		expect(result).toBeTruthy();
	});
});
