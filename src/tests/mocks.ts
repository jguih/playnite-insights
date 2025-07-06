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
				addPlayniteGame: vi.fn(),
				addPlayniteGameDeveloper: vi.fn(),
				addPlayniteGameGenre: vi.fn(),
				addPlayniteGamePlatform: vi.fn(),
				getTotalPlayniteGames: vi.fn(),
				getHomePagePlayniteGameList: vi.fn(),
				getPlayniteGameDevelopers: vi.fn(),
				getPlayniteGameById: vi.fn(),
				getDashPagePlayniteGameList: vi.fn(),
				playniteGameExists: vi.fn(),
				deleteDevelopersForPlayniteGame: vi.fn(),
				deletePlatformsForPlayniteGame: vi.fn(),
				deleteGenresForPlayniteGame: vi.fn(),
				addPlayniteGamePublisher: vi.fn(),
				deletePublishersForPlayniteGame: vi.fn(),
				updatePlayniteGame: vi.fn(),
				deletePlayniteGame: vi.fn(),
				getManifestData: vi.fn(),
				getTotalPlaytimeHours: vi.fn(),
				getTopMostPlayedGames: vi.fn()
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
