import { join } from 'path';
import type { FileSystemAsyncDeps } from '../types';
import type { LogService } from '@playnite-insights/services';

type MediaFilesServiceDeps = FileSystemAsyncDeps & {
	logService: LogService;
	FILES_DIR: string;
};

export const makeMediaFilesService = ({
	logService,
	access,
	stat,
	readfile,
	constants,
	FILES_DIR
}: MediaFilesServiceDeps) => {
	const checkIfImageExists = async (imagePath: string): Promise<boolean> => {
		try {
			await access(imagePath, constants.F_OK);
			return true;
		} catch {
			return false;
		}
	};

	const getImageStats = async (
		imagePath: string
	): Promise<{ lastModified: string; etag: string } | null> => {
		try {
			const stats = await stat(imagePath);
			const lastModified = stats.mtime.toUTCString();
			const etag = `"${stats.size}-${stats.mtimeMs}"`;
			return { lastModified, etag };
		} catch {
			logService.error(`Error getting image stats for: ${imagePath}`);
			return null;
		}
	};

	/**
	 * Retrieves a game image from the file system.
	 *
	 * @param playniteGameId Playnite game ID
	 * @param imageFileName Image file name as stored in Playnite
	 * @param ifNoneMatch if-none-match header value
	 * @param ifModifiedSince if-modified-since header value
	 * @returns Image data or an http code
	 */
	const getGameImage = async (
		playniteGameId: string,
		imageFileName: string,
		ifNoneMatch: string | null,
		ifModifiedSince: string | null
	): Promise<Response> => {
		const imagePath = join(FILES_DIR, playniteGameId, imageFileName);
		if (!(await checkIfImageExists(imagePath))) {
			return new Response(null, { status: 404 });
		}
		const imageStats = await getImageStats(imagePath);
		if (!imageStats) {
			return new Response(null, { status: 500 });
		}
		const { lastModified, etag } = imageStats;
		// Image cached and not modified
		if (ifNoneMatch === etag || ifModifiedSince === lastModified) {
			return new Response(null, { status: 304 });
		}
		const imageExtension = imageFileName.split('.').pop()?.toLowerCase();
		try {
			const imageFile = await readfile(imagePath);
			const response = new Response(new Uint8Array(imageFile), {
				headers: {
					'Content-Type': `image/${imageExtension}`,
					'Cache-Control': 'public, max-age=604800, immutable',
					'Last-Modified': lastModified,
					ETag: etag
				}
			});
			return response;
		} catch (error) {
			logService.error(`Error reading image file: ${imagePath}`, error as Error);
			return new Response(null, { status: 500 });
		}
	};

	return {
		getGameImage
	};
};
