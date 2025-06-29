import { playniteGameListSchema, type PlayniteGameMetadata } from '$lib/models/playnite-game';
import { randomUUID } from 'crypto';
import { writeFile, rename } from 'fs/promises';
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

const path = playniteInsightsConfig.path;

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
	const tmpFile = join(path.tmpDir, `games-${randomUUID()}.json`);
	try {
		logDebug(`Writing game list to temporary file: ${tmpFile}`);
		await fs.writeFile(tmpFile, JSON.stringify(games, null, 2));
		logDebug(`Temporary file written: ${tmpFile}`);
		await fs.rename(tmpFile, path.playniteGamesFile);
	} catch (error) {
		logError('Error writing game list to file', error as Error);
		return false;
	}
	return true;
};

const _parseGameListFromJsonBody = (
	body: unknown
): ReturnType<typeof playniteGameListSchema.safeParse> => {
	return playniteGameListSchema.safeParse(body);
};

/**
 * Imports a game list from a JSON body.
 */
export const importGameListFromJsonBody = async (
	body: unknown,
	parseGameListFromJsonBody: typeof _parseGameListFromJsonBody = _parseGameListFromJsonBody,
	writeGameListToFile: typeof _writeGameListToFile = _writeGameListToFile
): Promise<ValidationResult<null>> => {
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
	logInfo(`Importing ${parseResult.data.length} games`);
	const writeResult = await writeGameListToFile(parseResult.data);
	if (!writeResult) {
		logError('Failed to import games');
		return {
			isValid: false,
			message: 'Failed to write game list to file',
			httpCode: 500
		};
	}
	logSuccess('Game list imported successfully');
	const result = await writeLibraryManifest();
	if (!result.isValid) {
		return result;
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
	const destPath = join(path.tmpDir, filename);
	const fileStream = createWriteStream(destPath);
	try {
		logDebug(`Writing library files to temporary file: ${destPath}...`);
		await pipeline(nodeStream, fileStream);
		logDebug(`Library files written to temporary file: ${destPath}`);
		const zip = new AdmZip(destPath);
		logDebug('Extracting library files from zip...');
		zip.extractAllTo(path.filesDir, true);
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
		return result;
	}
	return {
		isValid: true,
		message: 'Library files imported successfully',
		httpCode: 200,
		data: null
	};
};
