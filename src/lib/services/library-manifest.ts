import { playniteInsightsConfig } from '$lib/config/config';
import { readdir, readFile, writeFile } from 'fs/promises';
import { logDebug, logError, logSuccess } from './log';
import { getGameList } from './game-repository';
import type { ValidationResult } from '$lib/models/validation-result';
import { watchFile } from 'fs';
import { hashFolderContents } from './hash';
import { join } from 'path';

type PlayniteLibraryManifest = {
	gamesInLibrary: number;
	mediaExistsFor: Array<{
		gameId: string;
		contentHash: string;
	}>;
};

const MANIFEST_FILE = playniteInsightsConfig.path.libraryManifestFile;
const FILES_DIR = playniteInsightsConfig.path.filesDir;
const WATCH_FILE_INTERVAL = 1000; // Interval in milliseconds to check for changes
let manifest: PlayniteLibraryManifest | null = null;

const loadLibraryManifest = async () => {
	logDebug('Loading manifest.json file to memory...');
	try {
		const content = await readFile(MANIFEST_FILE, 'utf-8');
		manifest = (JSON.parse(content.toString()) as PlayniteLibraryManifest) ?? null;
		logSuccess('Loaded manifest.json to memory sucessfully');
	} catch (error) {
		logError('Failed to load manifest.json or it doesnt exist', error as Error);
		manifest = null;
	}
};

// Load on server startup
loadLibraryManifest();

watchFile(MANIFEST_FILE, { interval: WATCH_FILE_INTERVAL }, async (curr, prev) => {
	if (curr.mtime !== prev.mtime) {
		await loadLibraryManifest();
	}
});

export const writeLibraryManifest = async (
	fsReaddir: typeof readdir = readdir,
	fsWritefile: typeof writeFile = writeFile,
	_hashFolderContents: typeof hashFolderContents = hashFolderContents
): Promise<ValidationResult<PlayniteLibraryManifest>> => {
	logDebug('Writing library manifest...');
	try {
		const entries = await fsReaddir(FILES_DIR, { withFileTypes: true });
		const libraryFolders = entries
			.filter((entry) => entry.isDirectory())
			.map((entry) => entry.name);
		const mediaExistsFor: PlayniteLibraryManifest['mediaExistsFor'] = [];
		for (const folder of libraryFolders) {
			const absolutePath = join(FILES_DIR, folder);
			const contentHash = await _hashFolderContents(absolutePath);
			if (!contentHash.isValid) {
				throw new Error(`Content hash for ${absolutePath} could not be created`);
			}
			mediaExistsFor.push({
				gameId: folder,
				contentHash: contentHash.data
			});
		}
		const manifest: PlayniteLibraryManifest = {
			gamesInLibrary: (await getGameList()).length,
			mediaExistsFor: mediaExistsFor
		};
		await fsWritefile(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
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

export const getPlayniteLibraryManifest = () => {
	return manifest;
};
