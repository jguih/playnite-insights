import { describe, expect, it, vi } from 'vitest';
import { writeLibraryManifest } from './library-manifest';

vi.mock('$lib/infrastructure/database', () => ({}));
const mockFsReaddir = vi.fn();
const mockFsWritefile = vi.fn();
const mockFnGetAllPlayniteGameManifestData = vi.fn();

describe('Library manifest', () => {
	it('Returns an empty array (mediaExistsFor) when no media exists', async () => {
		mockFsReaddir.mockImplementationOnce(() => []);
		mockFnGetAllPlayniteGameManifestData.mockImplementationOnce(() => []);
		const result = await writeLibraryManifest(
			mockFsReaddir,
			mockFsWritefile,
			mockFnGetAllPlayniteGameManifestData
		);
		expect(result.isValid).toBe(true);
		expect(result.data?.mediaExistsFor).toHaveLength(0);
	});
});
