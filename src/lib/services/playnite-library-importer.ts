import { playniteGameListSchema, type PlayniteGameMetadata } from '$lib/models/playnite-game';
import { randomUUID } from 'crypto';
import { writeFile, rename, rm } from 'fs/promises';
import { join } from 'path';
import { logDebug, logError, logInfo, logSuccess } from './log';
import { playniteInsightsConfig } from '$lib/config/config';
import type { ValidationResult } from '$lib/models/validation-result';
import AdmZip from 'adm-zip';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { type ReadableStream } from 'stream/web';
import { unlink } from 'fs/promises';
import { writeLibraryManifest } from './library-manifest';
import { z } from 'zod';

const FILES_DIR = playniteInsightsConfig.path.filesDir;
const PLAYNITE_GAMES_FILE = playniteInsightsConfig.path.playniteGamesFile;
const TMP_DIR = playniteInsightsConfig.path.tmpDir;

const syncGameListSchema = z.object({
	AddedItems: z.array(z.string()),
	RemovedItems: z.array(z.string()),
	GameList: playniteGameListSchema
});

const _writeGameListToFile = async (
	games: Array<PlayniteGameMetadata>,
	fs: {
		writeFile: typeof writeFile;
		rename: typeof rename;
	} = {
		writeFile,
		rename
	}
): Promise<boolean> => {
	const tmpFile = join(TMP_DIR, `games-${randomUUID()}.json`);
	try {
		logDebug(`Writing game list to temporary file: ${tmpFile}`);
		await fs.writeFile(tmpFile, JSON.stringify(games, null, 2));
		logDebug(`Temporary file ${tmpFile} written successfully`);
		logDebug(`Moving ${tmpFile} to ${PLAYNITE_GAMES_FILE}`);
		await fs.rename(tmpFile, PLAYNITE_GAMES_FILE);
		logSuccess(`Game list written to ${PLAYNITE_GAMES_FILE} successfully`);
	} catch (error) {
		logError('Error writing game list to file', error as Error);
		return false;
	}
	return true;
};

const _parseGameListFromJsonBody = (
	body: unknown
): ReturnType<typeof syncGameListSchema.safeParse> => {
	return syncGameListSchema.safeParse(body);
};

const _removeItems = async (gameIdList: string[]): Promise<ValidationResult> => {
	if (gameIdList.length === 0) {
		logInfo('No game media files to remove');
		return {
			isValid: true,
			message: 'No game media files to remove',
			httpCode: 200
		};
	}
	logDebug(`Removing media files for ${gameIdList}`);
	try {
		for (const gameId of gameIdList) {
			const gameMediaFolderDir = join(FILES_DIR, gameId);
			await rm(gameMediaFolderDir, { recursive: true, force: true });
			logInfo(`Deleted media folder ${gameMediaFolderDir}`);
		}
		logSuccess(`Media folder for ${gameIdList.length} games deleted successfully`);
		return {
			isValid: true,
			message: `Media folder for ${gameIdList.length} games deleted successfully`,
			httpCode: 200
		};
	} catch (error) {
		logError(`Failed to delete media folder a game`, error as Error);
		return {
			isValid: false,
			message: 'Failed to delete media folder for a game',
			httpCode: 500
		};
	}
};

/**
 * Imports a game list from a JSON body.
 */
export const importGameListFromJsonBody = async (
	body: unknown,
	parseGameListFromJsonBody: typeof _parseGameListFromJsonBody = _parseGameListFromJsonBody,
	writeGameListToFile: typeof _writeGameListToFile = _writeGameListToFile,
	removeItems: typeof _removeItems = _removeItems
): Promise<ValidationResult> => {
	logDebug('Parsing game list from JSON body');
	const parseResult = parseGameListFromJsonBody(body);
	if (parseResult.success === false) {
		logError('Invalid game data received', parseResult.error);
		return {
			isValid: false,
			message: 'Invalid game data',
			httpCode: 400,
			warnings: parseResult.error.issues.map((issue) => issue.message)
		};
	}
	logSuccess('Game list parsed successfully');
	const newGameList = parseResult.data.GameList;
	const addedItems = parseResult.data.AddedItems;
	const removedItems = parseResult.data.RemovedItems;
	logInfo(`Importing ${newGameList.length} games`);
	logInfo(`Games to add ${addedItems.length}`);
	logInfo(`Games to remove ${removedItems.length}`);
	const writeResult = await writeGameListToFile(parseResult.data.GameList);
	if (!writeResult) {
		return {
			isValid: false,
			message: 'Failed to write game list to file',
			httpCode: 500
		};
	}
	const removeItemsResult = await removeItems(removedItems);
	if (!removeItemsResult.isValid) {
		return removeItemsResult;
	}
	const writeManifestResult = await writeLibraryManifest();
	if (!writeManifestResult.isValid) {
		return { ...writeManifestResult, data: null };
	}
	return {
		isValid: true,
		message: 'Game list imported successfully',
		httpCode: 200,
		data: null
	};
};

/**
 * Imports library files (Playnite media files) from a FormData object.
 * @param body - The ReadableStream containing the Zip file.
 * @returns ValidationResult indicating success or failure of the import operation.
 */
export const importLibraryFiles = async (body: unknown | null): Promise<ValidationResult<null>> => {
	if (!body) {
		return {
			isValid: false,
			message: 'No body provided',
			httpCode: 400
		};
	}
	const webStream = body as unknown as ReadableStream<Uint8Array>;
	const nodeStream = Readable.fromWeb(webStream);
	const filename = `playnite-lib-${randomUUID()}.zip`;
	const destPath = join(TMP_DIR, filename);
	const fileStream = createWriteStream(destPath);
	try {
		logDebug(`Writing library files to temporary file: ${destPath}...`);
		await pipeline(nodeStream, fileStream);
		logDebug(`Library files written to temporary file: ${destPath}`);
		const zip = new AdmZip(destPath);
		logDebug('Extracting library files from zip...');
		zip.extractAllTo(FILES_DIR, true);
		logSuccess('Library files extracted successfully');
		const zipEntries = zip.getEntries();
		logInfo(`Extracted ${zipEntries.length} files from zip`);
	} catch (error) {
		logError('Failed to extract zip file', error as Error);
		return {
			isValid: false,
			message: 'Failed to extract library files from zip',
			httpCode: 500
		};
	}
	try {
		await unlink(destPath);
		logDebug(`Temporary zip file removed: ${destPath}`);
	} catch (error) {
		logError(`Failed to remove temporary zip file: ${destPath}`, error as Error);
	}
	const result = await writeLibraryManifest();
	if (!result.isValid) {
		return { ...result, data: null };
	}
	return {
		isValid: true,
		message: 'Library files imported successfully',
		httpCode: 200,
		data: null
	};
};
