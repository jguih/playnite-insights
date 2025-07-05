import { randomUUID } from 'crypto';
import { join } from 'path';
import type { ValidationResult } from '$lib/models/validation-result';
import AdmZip from 'adm-zip';
import { type ReadableStream } from 'stream/web';
import { unlink } from 'fs/promises';
import { z } from 'zod';
import { incomingPlayniteGameDtoSchema } from '$lib/playnite-library-sync/schemas';
import { repositories, services } from '$lib';
import type { FileSystemAsyncDeps, StreamUtilsAsyncDeps } from './types';

type PlayniteLibraryImporterServiceDeps = FileSystemAsyncDeps &
	StreamUtilsAsyncDeps & {
		playniteGameRepository: typeof repositories.playniteGame;
		libraryManifestService: typeof services.libraryManifest;
		FILES_DIR: string;
		TMP_DIR: string;
		createZip: (path: string) => AdmZip;
	};

const syncGameListCommandSchema = z.object({
	AddedItems: z.array(incomingPlayniteGameDtoSchema),
	RemovedItems: z.array(z.string()),
	UpdatedItems: z.array(incomingPlayniteGameDtoSchema)
});
export type SyncLibraryCommand = z.infer<typeof syncGameListCommandSchema>;

export const makePlayniteLibraryImporterService = (deps: PlayniteLibraryImporterServiceDeps) => {
	/**
	 * Synchronizes game metadata from Playnite Insights Exporter with the database
	 */
	const sync = async (data: SyncLibraryCommand) => {
		try {
			services.log.logInfo(`Games to add: ${data.AddedItems.length}`);
			services.log.logInfo(`Games to update: ${data.UpdatedItems.length}`);
			services.log.logInfo(`Games to delete: ${data.RemovedItems.length}`);
			// Games to add
			for (const game of data.AddedItems) {
				const exists = deps.playniteGameRepository.playniteGameExists(game.Id);
				if (exists) {
					services.log.logInfo(`Skipping existing game ${game.Name}`);
					continue;
				}
				const result = deps.playniteGameRepository.addPlayniteGame(
					{
						Id: game.Id,
						IsInstalled: Number(game.IsInstalled),
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
					game.Developers ?? [],
					game.Platforms?.map((plat) => {
						return {
							Id: plat.Id,
							Name: plat.Name,
							SpecificationId: plat.SpecificationId,
							Background: plat.Background ?? null,
							Cover: plat.Cover ?? null,
							Icon: plat.Icon ?? null
						};
					}),
					game.Genres ?? [],
					game.Publishers ?? []
				);
				// TODO: Sync genres, platforms and publishers
				if (!result) {
					services.log.logError(`Failed to add game ${game.Name}`);
				}
			}
			// Games to update
			for (const game of data.UpdatedItems) {
				const exists = deps.playniteGameRepository.playniteGameExists(game.Id);
				if (!exists) {
					services.log.logInfo(`Skipping game to update ${game.Name}, as it doesn't exist`);
					continue;
				}
				const result = deps.playniteGameRepository.updatePlayniteGame(
					{
						Id: game.Id,
						IsInstalled: Number(game.IsInstalled),
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
					game.Developers ?? [],
					game.Platforms?.map((plat) => {
						return {
							Id: plat.Id,
							Name: plat.Name,
							SpecificationId: plat.SpecificationId,
							Background: plat.Background ?? null,
							Cover: plat.Cover ?? null,
							Icon: plat.Icon ?? null
						};
					}),
					game.Genres ?? [],
					game.Publishers ?? []
				);
				// TODO: Sync devs, genres, platforms and publishers
				if (!result) {
					services.log.logError(`Failed to update game ${game.Name}`);
				}
			}
			// Games to delete
			for (const gameId of data.RemovedItems) {
				const result = deps.playniteGameRepository.deletePlayniteGame(gameId);
				if (!result) {
					services.log.logError(`Failed to delete game with id ${gameId}`);
				}
				const gameMediaFolderDir = join(deps.FILES_DIR, gameId);
				try {
					await deps.rm(gameMediaFolderDir, { recursive: true, force: true });
					services.log.logInfo(`Deleted media folder ${gameMediaFolderDir}`);
				} catch (error) {
					services.log.logError(
						`Failed to delete media folder ${gameMediaFolderDir}`,
						error as Error
					);
				}
			}
			const totalPlaytimeHours = deps.playniteGameRepository.getTotalPlaytimeHours();
			const totalGamesInLib = deps.playniteGameRepository.getTotalPlayniteGames();
			repositories.playniteLibrarySync.addPlayniteLibrarySync(
				totalPlaytimeHours ?? 0,
				totalGamesInLib ?? 0
			);
			deps.libraryManifestService.write();
			return true;
		} catch (error) {
			services.log.logError(`Failed to import game list`, error as Error);
			return false;
		}
	};

	/**
	 * Imports library files (Playnite media files) from a FormData object.
	 * @param body - The ReadableStream containing the Zip file.
	 * @returns ValidationResult indicating success or failure of the import operation.
	 */
	const importMediaFiles = async (body: unknown | null): Promise<ValidationResult<null>> => {
		if (!body) {
			return {
				isValid: false,
				message: 'No body provided',
				httpCode: 400
			};
		}
		const webStream = body as unknown as ReadableStream<Uint8Array>;
		const nodeStream = deps.readableFromWeb(webStream);
		const filename = `playnite-lib-${randomUUID()}.zip`;
		const destPath = join(deps.TMP_DIR, filename);
		const fileStream = deps.createWriteStream(destPath);
		try {
			services.log.logDebug(`Writing library files to temporary file: ${destPath}...`);
			await deps.pipeline(nodeStream, fileStream);
			services.log.logDebug(`Library files written to temporary file: ${destPath}`);
			const zip = deps.createZip(destPath);
			services.log.logDebug('Extracting library files from zip...');
			zip.extractAllTo(deps.FILES_DIR, true);
			services.log.logSuccess('Library files extracted successfully');
			const zipEntries = zip.getEntries();
			services.log.logInfo(`Extracted ${zipEntries.length} files from zip`);
		} catch (error) {
			services.log.logError('Failed to extract zip file', error as Error);
			return {
				isValid: false,
				message: 'Failed to extract library files from zip',
				httpCode: 500
			};
		}
		try {
			await unlink(destPath);
			services.log.logDebug(`Temporary zip file removed: ${destPath}`);
		} catch (error) {
			services.log.logError(`Failed to remove temporary zip file: ${destPath}`, error as Error);
		}
		const result = await deps.libraryManifestService.write();
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

	return {
		sync,
		importMediaFiles,
		syncGameListCommandSchema
	};
};
