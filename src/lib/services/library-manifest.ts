import { logDebug, logError, logSuccess } from './log';
import { type GetManifestDataResult } from '../playnite-game/playnite-game-repository';
import { join } from 'path';
import type { FileSystemAsyncDeps } from './types';

export type PlayniteLibraryManifest = {
	totalGamesInLibrary: number;
	gamesInLibrary: Array<{
		gameId: string;
		contentHash: string;
	}>;
	mediaExistsFor: Array<{
		gameId: string;
		contentHash: string;
	}>;
};

type LibraryManifestServiceDeps = FileSystemAsyncDeps & {
	getManifestData: () => GetManifestDataResult;
	MANIFEST_FILE: string;
	FILES_DIR: string;
	CONTENT_HASH_FILE_NAME: string;
};

export const makeLibraryManifestService = (deps: LibraryManifestServiceDeps) => {
	const write = async () => {
		logDebug('Writing library manifest...');
		try {
			const gamesInLibrary: PlayniteLibraryManifest['gamesInLibrary'] = [];
			const gamesManifestData = deps.getManifestData();
			if (!gamesManifestData) {
				throw new Error('Failed to fetch all game Ids');
			}
			for (const data of gamesManifestData) {
				gamesInLibrary.push({ gameId: data.Id, contentHash: data.ContentHash });
			}
			// Get all library folders from files directory (one folder for each game)
			const entries = await deps.readdir(deps.FILES_DIR, { withFileTypes: true });
			const libraryFolders = entries
				.filter((entry) => entry.isDirectory())
				.map((entry) => entry.name);
			const mediaExistsFor: PlayniteLibraryManifest['mediaExistsFor'] = [];
			// Read the contentHash.txt inside every library folder and append it to the manifest's `mediaExistsFor`
			for (const folder of libraryFolders) {
				if (folder == 'placeholder') continue;
				const contentHashFilePath = join(deps.FILES_DIR, folder, deps.CONTENT_HASH_FILE_NAME);
				await deps.access(contentHashFilePath);
				const contentHash = await deps.readfile(contentHashFilePath, 'utf-8');
				mediaExistsFor.push({
					gameId: folder,
					contentHash: contentHash
				});
			}
			const manifest: PlayniteLibraryManifest = {
				totalGamesInLibrary: gamesInLibrary.length,
				gamesInLibrary: gamesInLibrary,
				mediaExistsFor: mediaExistsFor
			};
			await deps.writeFile(deps.MANIFEST_FILE, JSON.stringify(manifest, null, 2));
			logSuccess('manifest.json written sucessfully');
			return {
				isValid: true,
				message: 'manifest.json written sucessfully',
				httpCode: 200,
				data: manifest
			};
		} catch (error) {
			logError('Error while writing manifest.json', error as Error);
			return {
				isValid: false,
				message: 'Failed to write manifest.json',
				httpCode: 500
			};
		}
	};

	const get = async () => {
		try {
			logDebug(`Reading library manifest JSON file at ${deps.MANIFEST_FILE}`);
			const content = await deps.readfile(deps.MANIFEST_FILE, 'utf-8');
			const asJson = JSON.parse(content.toString()) as PlayniteLibraryManifest;
			logDebug(`Read manifest JSON file succesfully, returning manifest`);
			return asJson ?? null;
		} catch (error) {
			logError('Failed to load manifest.json or it doesnt exist', error as Error);
			return null;
		}
	};

	return {
		write,
		get
	};
};
