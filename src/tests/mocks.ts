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
		playniteGame: () => {
			return {
				add: vi.fn(),
				update: vi.fn(),
				remove: vi.fn(),
				exists: vi.fn(),
				addDeveloperFor: vi.fn(),
				addGenreFor: vi.fn(),
				addPlatformFor: vi.fn(),
				addPublisherFor: vi.fn(),
				deleteDevelopersFor: vi.fn(),
				deleteGenresFor: vi.fn(),
				deletePlatformsFor: vi.fn(),
				deletePublishersFor: vi.fn(),
				getTopMostPlayedGames: vi.fn(),
				getDashPageGameList: vi.fn(),
				getById: vi.fn(),
				getTotalPlaytimeHours: vi.fn(),
				getManifestData: vi.fn(),
				getDevelopers: vi.fn(),
				getHomePagePlayniteGameList: vi.fn(),
				getTotal: vi.fn()
			};
		},
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
