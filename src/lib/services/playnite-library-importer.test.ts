// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import {
// 	makePlayniteLibraryImporterService,
// 	type SyncLibraryCommand
// } from './playnite-library-importer';

// vi.mock('$lib/infrastructure/database', () => ({}));

// const service = makePlayniteLibraryImporterService({});

// describe('Game Importer', () => {
// 	beforeEach(() => {
// 		vi.resetAllMocks();
// 	});

// 	it('should return error when importing invalid json body', async () => {
// 		// Arrange
// 		const invalidJson = { invalid: 'data' };
// 		// Act
// 		const result = await service.sync(invalidJson as unknown as SyncLibraryCommand);
// 		// Assert
// 		expect(result).toBe(false);
// 	});
// });
