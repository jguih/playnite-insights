import { importGameListFromJsonBody } from './playnite-library-importer';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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
		const mockParseGameListFromJsonBody = vi
			.fn()
			.mockReturnValue({ success: true, data: ['item1'] });
		const mockWriteGameListToFile = vi.fn().mockResolvedValue(false);
		// Act
		const result = await importGameListFromJsonBody(
			{},
			mockParseGameListFromJsonBody,
			mockWriteGameListToFile
		);
		// Assert
		expect(result.isValid).toBe(false);
		expect(result.httpCode).toBe(500);
	});
});
