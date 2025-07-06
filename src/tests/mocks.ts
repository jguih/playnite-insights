import { vi } from 'vitest';

export const createMock = () => {
	const fsAsyncDeps = () => {
		return {
			access: vi.fn(),
			readdir: vi.fn(),
			readfile: vi.fn(),
			rm: vi.fn(),
			unlink: vi.fn(),
			writeFile: vi.fn()
		};
	};

	const streamUtilsAsyncDeps = () => {
		return {
			readableFromWeb: vi.fn(),
			pipeline: vi.fn(),
			createWriteStream: vi.fn()
		};
	};

	const repository = {
		playniteLibrarySync: () => {
			return {
				getTotalPlaytimeOverLast6Months: vi.fn(),
				getTotalGamesOwnedOverLast6Months: vi.fn(),
				addPlayniteLibrarySync: vi.fn()
			};
		}
	};

	const service = {
		libraryManifest: () => {
			return {
				write: vi.fn(),
				get: vi.fn()
			};
		}
	};

	return { fsAsyncDeps, streamUtilsAsyncDeps, repository, service };
};
