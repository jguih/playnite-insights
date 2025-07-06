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
	return { fsAsyncDeps };
};
