import { playniteInsightsConfig } from '$lib/config/config';
import { readdir, writeFile } from 'fs/promises';
import { logDebug, logError, logSuccess } from './log';
import { getGameList } from './game-repository';
import type { ValidationResult } from '$lib/models/validation-result';

const MANIFEST_FILE = playniteInsightsConfig.path.libraryManifestFile;
const FILES_DIR = playniteInsightsConfig.path.filesDir;

export const writeLibraryManifest = async (): Promise<ValidationResult<null>> => {
	logDebug('Writing library manifest...');
	try {
		const entries = await readdir(FILES_DIR, { withFileTypes: true });
		const libraryFolders = entries
			.filter((entry) => entry.isDirectory())
			.map((entry) => entry.name);
		const manifest = {
			gamesInLibrary: (await getGameList()).length,
			mediaExistsFor: libraryFolders
		};
		await writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
		logSuccess('manifest.json written sucessfully');
		return {
			isValid: true,
			message: 'manifest.json written sucessfully',
			httpCode: 200,
			data: null
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
