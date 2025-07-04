import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncGameList } from './playnite-library-importer';

vi.mock('$lib/infrastructure/database', () => ({}));

describe('Game Importer', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should return error when importing invalid json body', async () => {
		// Arrange
		const invalidJson = { invalid: 'data' };
		// Act
		const result = await syncGameList(invalidJson);
		// Assert
		expect(result).toBe(false);
	});
});
