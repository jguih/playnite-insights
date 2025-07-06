import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMocks } from '../../tests/mocks';
import type z from 'zod';
import { makePlayniteLibraryImporterService } from './playnite-library-importer';
import { join } from 'path';

vi.mock('$lib/infrastructure/database', () => ({}));

const createDeps = () => {
	const mocks = createMocks();
	return {
		...mocks.fsAsyncDeps,
		...mocks.streamUtilsAsyncDeps,
		playniteGameRepository: mocks.repository.playniteGame,
		libraryManifestService: mocks.services.libraryManifest,
		logService: mocks.services.log,
		playniteLibrarySyncRepository: mocks.repository.playniteLibrarySync,
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
		vi.spyOn(deps.playniteGameRepository, 'exists').mockReturnValueOnce(true);
		const addSpy = vi.spyOn(deps.playniteGameRepository, 'add');
		// Act
		const result = await service.sync(data);
		// Assert
		expect(addSpy).not.toHaveBeenCalled();
		expect(result).toBeTruthy();
	});

	it('should add a game if it doesnt exist', async () => {
		// Arrange
		const data: z.infer<typeof service.syncGameListCommandSchema> = {
			AddedItems: [{ Id: 'id1', Playtime: 12, ContentHash: 'hash', IsInstalled: false }],
			RemovedItems: [],
			UpdatedItems: []
		};
		vi.spyOn(deps.playniteGameRepository, 'exists').mockReturnValueOnce(false);
		const addSpy = vi.spyOn(deps.playniteGameRepository, 'add');
		// Act
		const result = await service.sync(data);
		// Assert
		expect(addSpy).toHaveBeenCalled();
		expect(result).toBeTruthy();
	});

	it('should not update game if it doesnt exist', async () => {
		// Arrange
		const data: z.infer<typeof service.syncGameListCommandSchema> = {
			AddedItems: [],
			RemovedItems: [],
			UpdatedItems: [{ Id: 'id1', Playtime: 12, ContentHash: 'hash', IsInstalled: false }]
		};
		vi.spyOn(deps.playniteGameRepository, 'exists').mockReturnValueOnce(false);
		const updateSpy = vi.spyOn(deps.playniteGameRepository, 'update');
		// Act
		const result = await service.sync(data);
		// Assert
		expect(updateSpy).not.toHaveBeenCalled();
		expect(result).toBeTruthy();
	});

	it('should update a game if it exists', async () => {
		// Arrange
		const data: z.infer<typeof service.syncGameListCommandSchema> = {
			AddedItems: [],
			RemovedItems: [],
			UpdatedItems: [{ Id: 'id1', Playtime: 12, ContentHash: 'hash', IsInstalled: false }]
		};
		vi.spyOn(deps.playniteGameRepository, 'exists').mockReturnValueOnce(true);
		const updateSpy = vi.spyOn(deps.playniteGameRepository, 'update');
		// Act
		const result = await service.sync(data);
		// Assert
		expect(updateSpy).toHaveBeenCalled();
		expect(result).toBeTruthy();
	});

	it('should delete a game and its media folder', async () => {
		// Arrange
		const data: z.infer<typeof service.syncGameListCommandSchema> = {
			AddedItems: [],
			RemovedItems: ['id1'],
			UpdatedItems: []
		};
		vi.spyOn(deps.playniteGameRepository, 'remove').mockReturnValueOnce(true);
		// Act
		const result = await service.sync(data);
		// Assert
		expect(deps.rm).toHaveBeenCalledWith(join(deps.FILES_DIR, 'id1'), expect.anything());
		expect(result).toBeTruthy();
	});
});
