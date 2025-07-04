import { randomUUID } from 'crypto';
import { rm } from 'fs/promises';
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
import {
	addPlayniteGame,
	deletePlayniteGame,
	getTotalPlaytimeHours,
	playniteGameExists,
	updatePlayniteGame
} from './playnite-game-repository';
import { addPlayniteLibrarySync } from './playnite-library-sync-repository';
import { incomingPlayniteGameDtoSchema } from '$lib/models/dto/incoming-playnite-game-dto';

const FILES_DIR = playniteInsightsConfig.path.filesDir;
const TMP_DIR = playniteInsightsConfig.path.tmpDir;

const syncGameListSchema = z.object({
	AddedItems: z.array(incomingPlayniteGameDtoSchema),
	RemovedItems: z.array(z.string()),
	UpdatedItems: z.array(incomingPlayniteGameDtoSchema)
});

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

/**
 * Synchronizes game metadata from Playnite Insights Exporter with the database
 */
export const syncGameList = async (body: unknown) => {
	try {
		const data = syncGameListSchema.parse(body);
		logInfo(`Games to add: ${data.AddedItems.length}`);
		logInfo(`Games to update: ${data.UpdatedItems.length}`);
		logInfo(`Games to delete: ${data.RemovedItems.length}`);
		const totalPlaytimeHours = getTotalPlaytimeHours();
		// TODO: Get total games in lib
		const totalGamesInLib = data.AddedItems.length;
		// Games to add
		for (const game of data.AddedItems) {
			const exists = playniteGameExists(game.Id);
			if (exists) {
				logInfo(`Skipping existing game ${game.Name}`);
				continue;
			}
			const result = addPlayniteGame(
				{
					Id: game.Id,
					IsInstalled: game.IsInstalled,
					Playtime: game.Playtime,
					Added: game.Added,
					BackgroundImage: game.BackgroundImage,
					CoverImage: game.CoverImage,
					Description: game.Description,
					Icon: game.Icon,
					InstallDirectory: game.InstallDirectory,
					LastActivity: game.LastActivity,
					Name: game.Name,
					ReleaseDate: game.ReleaseDate?.ReleaseDate,
					ContentHash: game.ContentHash
				},
				game.Developers
			);
			// TODO: Sync genres, platforms and publishers
			if (!result) {
				logError(`Failed to add game ${game.Name}`);
			}
		}
		// Games to update
		for (const game of data.UpdatedItems) {
			const exists = playniteGameExists(game.Id);
			if (!exists) {
				logInfo(`Skipping game to update ${game.Name}, as it doesn't exist`);
				continue;
			}
			const result = updatePlayniteGame({
				Id: game.Id,
				IsInstalled: game.IsInstalled,
				Playtime: game.Playtime,
				Added: game.Added,
				BackgroundImage: game.BackgroundImage,
				CoverImage: game.CoverImage,
				Description: game.Description,
				Icon: game.Icon,
				InstallDirectory: game.InstallDirectory,
				LastActivity: game.LastActivity,
				Name: game.Name,
				ReleaseDate: game.ReleaseDate?.ReleaseDate,
				ContentHash: game.ContentHash
			});
			// TODO: Sync devs, genres, platforms and publishers
			if (!result) {
				logError(`Failed to update game ${game.Name}`);
			}
		}
		// Games to delete
		for (const gameId of data.RemovedItems) {
			const result = deletePlayniteGame(gameId);
			if (!result) {
				logError(`Failed to delete game with id ${gameId}`);
			}
			const gameMediaFolderDir = join(FILES_DIR, gameId);
			try {
				await rm(gameMediaFolderDir, { recursive: true, force: true });
				logInfo(`Deleted media folder ${gameMediaFolderDir}`);
			} catch (error) {
				logError(`Failed to delete media folder ${gameMediaFolderDir}`, error as Error);
			}
		}
		if (totalPlaytimeHours !== undefined && totalGamesInLib !== undefined) {
			addPlayniteLibrarySync(totalPlaytimeHours, totalGamesInLib);
		} else {
			logError(
				`Failed to add playnite library sync entry, required values are invalid or undefined. \ntotalPlaytimeHours: ${totalPlaytimeHours}, totalGamesInLib: ${totalGamesInLib}`
			);
		}
		writeLibraryManifest();
		return true;
	} catch (error) {
		logError(`Failed to import game list`, error as Error);
		return false;
	}
};
