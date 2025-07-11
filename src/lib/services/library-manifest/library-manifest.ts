import { join } from 'path';
import type { FileSystemAsyncDeps } from '../types';
import type { makeLogService } from '../log';
import type { PlayniteGameRepository } from '../playnite-game';
import type { ValidationResult } from '$lib/models/validation-result';
import type { PlayniteLibraryManifest } from './schemas';

type LibraryManifestServiceDeps = FileSystemAsyncDeps & {
	getManifestData: PlayniteGameRepository['getManifestData'];
	logService: ReturnType<typeof makeLogService>;
	LIBRARY_MANIFEST_FILE: string;
	FILES_DIR: string;
	CONTENT_HASH_FILE_NAME: string;
};

export type LibraryManifestService = {
	write: () => Promise<ValidationResult<PlayniteLibraryManifest>>;
	get: () => Promise<PlayniteLibraryManifest | null>;
};

export const makeLibraryManifestService = (
	deps: LibraryManifestServiceDeps
): LibraryManifestService => {
	const write = async () => {
		deps.logService.debug('Writing library manifest...');
		try {
			const gamesInLibrary: PlayniteLibraryManifest['gamesInLibrary'] = [];
			const gamesManifestData = deps.getManifestData();
			if (!gamesManifestData) {
				throw new Error('Failed to fetch manifest data');
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
			await deps.writeFile(deps.LIBRARY_MANIFEST_FILE, JSON.stringify(manifest, null, 2));
			deps.logService.success('manifest.json written successfully');
			return {
				isValid: true,
				message: 'manifest.json written sucessfully',
				httpCode: 200,
				data: manifest
			};
		} catch (error) {
			deps.logService.error('Error while writing manifest.json', error as Error);
			return {
				isValid: false,
				message: 'Failed to write manifest.json',
				httpCode: 500
			};
		}
	};

	const get = async () => {
		try {
			deps.logService.debug(`Reading library manifest file at ${deps.LIBRARY_MANIFEST_FILE}`);
			const content = await deps.readfile(deps.LIBRARY_MANIFEST_FILE, 'utf-8');
			const asJson = JSON.parse(content.toString()) as PlayniteLibraryManifest;
			deps.logService.debug(`Read library manifest file succesfully, returning manifest`);
			return asJson ?? null;
		} catch (error) {
			if (typeof error === 'object' && error != null && 'code' in error) {
				if (error.code === 'ENOENT') {
					deps.logService.warning('Library manifest file does not exist');
					return null;
				}
			}
			deps.logService.error('Failed to load library manifest', error as Error);
			return null;
		}
	};

	return {
		write,
		get
	};
};
