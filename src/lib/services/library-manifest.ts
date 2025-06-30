import { playniteInsightsConfig } from '$lib/config/config';
import { access, readdir, readFile, writeFile } from 'fs/promises';
import { logDebug, logError, logSuccess } from './log';
import { getGameList } from './game-repository';
import type { ValidationResult } from '$lib/models/validation-result';
import { join } from 'path';

type PlayniteLibraryManifest = {
	totalGamesInLibrary: number;
	gamesInLibrary: string[];
	mediaExistsFor: Array<{
		gameId: string;
		contentHash: string;
	}>;
};

const MANIFEST_FILE = playniteInsightsConfig.path.libraryManifestFile;
const FILES_DIR = playniteInsightsConfig.path.filesDir;
const CONTENT_HASH_FILE_NAME = 'contentHash.txt';
let manifest: PlayniteLibraryManifest | null = null;

export const loadLibraryManifest = async () => {
	logDebug('Loading manifest.json file into memory...');
	try {
		const content = await readFile(MANIFEST_FILE, 'utf-8');
		manifest = (JSON.parse(content.toString()) as PlayniteLibraryManifest) ?? null;
		logSuccess('Loaded manifest.json to memory sucessfully.');
	} catch (error) {
		logError('Failed to load manifest.json or it doesnt exist', error as Error);
		manifest = null;
	}
};

export const writeLibraryManifest = async (
	fsReaddir: typeof readdir = readdir,
	fsWritefile: typeof writeFile = writeFile
): Promise<ValidationResult<PlayniteLibraryManifest>> => {
	logDebug('Writing library manifest...');
	try {
		const entries = await fsReaddir(FILES_DIR, { withFileTypes: true });
		const libraryFolders = entries
			.filter((entry) => entry.isDirectory())
			.map((entry) => entry.name);
		const mediaExistsFor: PlayniteLibraryManifest['mediaExistsFor'] = [];
		for (const folder of libraryFolders) {
			const contentHashFilePath = join(FILES_DIR, folder, CONTENT_HASH_FILE_NAME);
			await access(contentHashFilePath);
			const contentHash = await readFile(contentHashFilePath, 'utf-8');
			mediaExistsFor.push({
				gameId: folder,
				contentHash: contentHash
			});
		}
		const gameList = await getGameList();
		const manifest: PlayniteLibraryManifest = {
			totalGamesInLibrary: gameList.length,
			gamesInLibrary: gameList.map((g) => g.Id),
			mediaExistsFor: mediaExistsFor
		};
		await fsWritefile(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
		logSuccess('manifest.json written sucessfully');
		await loadLibraryManifest();
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
