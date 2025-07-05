// import { describe, expect, it, vi } from 'vitest';
// import { makeLibraryManifestService } from './library-manifest';

// vi.mock('$lib/infrastructure/database', () => ({}));

// const mockFsReaddir = vi.fn();
// const mockFsWritefile = vi.fn();
// const mockFnGetAllPlayniteGameManifestData = vi.fn();

// const service = makeLibraryManifestService({});

// describe('Library manifest', () => {
// 	it('Returns an empty array (mediaExistsFor) when no media exists', async () => {
// 		mockFsReaddir.mockImplementationOnce(() => []);
// 		mockFnGetAllPlayniteGameManifestData.mockImplementationOnce(() => []);
// 		const result = await service.write();
// 		expect(result.isValid).toBe(true);
// 		expect(result.data?.mediaExistsFor).toHaveLength(0);
// 	});
// });
