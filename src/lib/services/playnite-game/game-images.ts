import { join } from 'path';
import { logError } from '../../services/log';
import { access, constants, readFile, stat } from 'fs/promises';
import type { ValidationResult } from '$lib/models/validation-result';
import * as config from '../../config/config';

const IMAGE_DIR = config.FILES_DIR;

const _checkIfImageExists = async (imagePath: string): Promise<boolean> => {
	try {
		await access(imagePath, constants.F_OK);
		return true;
	} catch {
		return false;
	}
};

const _getImageStats = async (
	imagePath: string
): Promise<{ lastModified: string; etag: string } | null> => {
	try {
		const stats = await stat(imagePath);
		const lastModified = stats.mtime.toUTCString();
		const etag = `"${stats.size}-${stats.mtimeMs}"`;
		return { lastModified, etag };
	} catch {
		logError(`Error getting image stats for: ${imagePath}`);
		return null;
	}
};

/**
 * Retrieves a game image from the file system.
 *
 * @param playniteGameId Playnite game ID
 * @param playniteImageFileName Image file name as stored in Playnite
 * @param ifNoneMatch if-none-match header value
 * @param ifModifiedSince if-modified-since header value
 * @param fsReadFile (optional) Function to read the file, defaults to `fs.promises.readFile`
 * @returns ValidationResult containing the image response or an error message
 */
export const getGameImage = async (
	playniteGameId: string,
	playniteImageFileName: string,
	ifNoneMatch: string | null,
	ifModifiedSince: string | null,
	checkIfImageExists: typeof _checkIfImageExists = _checkIfImageExists,
	getImageStats: typeof _getImageStats = _getImageStats,
	fsReadFile: typeof readFile = readFile
): Promise<ValidationResult<Response>> => {
	const imagePath = join(IMAGE_DIR, playniteGameId, playniteImageFileName);
	if (!(await checkIfImageExists(imagePath))) {
		return {
			isValid: false,
			message: `Image not found: ${imagePath}`,
			httpCode: 404
		};
	}
	const imageStats = await getImageStats(imagePath);
	if (!imageStats) {
		return {
			isValid: false,
			message: `Failed to retrieve image stats for: ${imagePath}`,
			httpCode: 500
		};
	}
	const { lastModified, etag } = imageStats;
	// Image cached and not modified
	if (ifNoneMatch === etag || ifModifiedSince === lastModified) {
		return {
			isValid: false,
			message: `Image not modified: ${imagePath}`,
			httpCode: 304
		};
	}
	const imageExtension = playniteImageFileName.split('.').pop()?.toLowerCase();
	try {
		const imageFile = await fsReadFile(imagePath);
		const response = new Response(new Uint8Array(imageFile), {
			headers: {
				'Content-Type': `image/${imageExtension}`,
				'Cache-Control': 'public, max-age=604800, immutable',
				'Last-Modified': lastModified,
				ETag: etag
			}
		});
		return {
			isValid: true,
			message: `Image retrieved successfully: ${imagePath}`,
			httpCode: 200,
			data: response
		};
	} catch (error) {
		logError(`Error reading image file: ${imagePath}`, error as Error);
		return {
			isValid: false,
			message: `Error reading image file: ${imagePath}`,
			httpCode: 500
		};
	}
};
