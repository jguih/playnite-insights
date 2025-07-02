import { describe, expect, it, vi } from 'vitest';
import { writeLibraryManifest } from './library-manifest';

const mockFsReaddir = vi.fn();
const mockFsWritefile = vi.fn();

describe('Library manifest', () => {
	it('Returns error when hash folder contents fail', async () => {
		mockFsReaddir.mockImplementationOnce(() => {
			return [
				{ name: 'dir1', isDirectory: () => true },
				{ name: 'dir2', isDirectory: () => true }
			];
		});
		const result = await writeLibraryManifest(mockFsReaddir, mockFsWritefile);
		expect(result.isValid).toBe(false);
	});

	it('Returns an empty array (mediaExistsFor) when no media exists', async () => {
		mockFsReaddir.mockImplementationOnce(() => []);
		const result = await writeLibraryManifest(mockFsReaddir, mockFsWritefile);
		expect(result.isValid).toBe(true);
		expect(result.data?.mediaExistsFor).toHaveLength(0);
	});
});
