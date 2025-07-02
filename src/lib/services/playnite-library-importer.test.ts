import { importGameListFromJsonBody } from './playnite-library-importer';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/infrastructure/database', () => ({}));

const mock = {
	parseGameListFromJsonBody: vi.fn(),
	writeGameListToFile: vi.fn(),
	removeItems: vi.fn(),
	addPlayniteLibrarySync: vi.fn()
};

describe('Game Importer', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should return error when importing invalid json body', async () => {
		// Arrange
		const invalidJson = { invalid: 'data' };
		// Act
		const result = await importGameListFromJsonBody(invalidJson);
		// Assert
		expect(result.isValid).toBe(false);
		expect(result.httpCode).toBe(400);
	});

	it('should return error when writing game list to file fails', async () => {
		// Arrange
		mock.parseGameListFromJsonBody.mockReturnValue({
			success: true,
			data: { GameList: ['item1'], AddedItems: [], RemovedItems: [] }
		});
		mock.writeGameListToFile.mockResolvedValue(false);
		// Act
		const result = await importGameListFromJsonBody(
			{},
			mock.parseGameListFromJsonBody,
			mock.writeGameListToFile
		);
		// Assert
		expect(result.isValid).toBe(false);
		expect(result.httpCode).toBe(500);
	});

	it('should return success if main operation succeeds, even if other operations fail', async () => {
		// Arrange
		mock.parseGameListFromJsonBody.mockReturnValue({
			success: true,
			data: { GameList: ['item1'], AddedItems: [], RemovedItems: [] }
		});
		mock.writeGameListToFile.mockResolvedValueOnce(true);
		mock.removeItems.mockResolvedValueOnce({ isValid: false });
		mock.addPlayniteLibrarySync.mockResolvedValueOnce({ isValid: false });
		// Act
		const result = await importGameListFromJsonBody(
			{},
			mock.parseGameListFromJsonBody,
			mock.writeGameListToFile,
			mock.removeItems,
			mock.addPlayniteLibrarySync
		);
		// Assert
		expect(result.isValid).toBe(true);
	});
});
