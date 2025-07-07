import { randomUUID } from 'crypto';
import { join } from 'path';
import type { ValidationResult } from '$lib/models/validation-result';
import AdmZip from 'adm-zip';
import { type ReadableStream } from 'stream/web';
import { unlink } from 'fs/promises';
import type { FileSystemAsyncDeps, StreamUtilsAsyncDeps } from '../types';
import type { LibraryManifestService } from '../library-manifest';
import type { PlayniteLibrarySyncRepository } from '$lib/services/playnite-library-sync/repository';
import type { LogService } from '../log';
import type { PlayniteGameRepository } from '../playnite-game';
import { type SyncGameListCommand } from './schemas';

type PlayniteLibraryImporterServiceDeps = FileSystemAsyncDeps &
	StreamUtilsAsyncDeps & {
		playniteGameRepository: PlayniteGameRepository;
		libraryManifestService: LibraryManifestService;
		playniteLibrarySyncRepository: PlayniteLibrarySyncRepository;
		logService: LogService;
		FILES_DIR: string;
		TMP_DIR: string;
		createZip: (path: string) => AdmZip;
	};

export const makePlayniteLibraryImporterService = (deps: PlayniteLibraryImporterServiceDeps) => {
	/**
	 * Synchronizes game metadata from Playnite Insights Exporter with the database
	 */
	const sync = async (data: SyncGameListCommand) => {
		try {
			deps.logService.info(`Games to add: ${data.AddedItems.length}`);
			deps.logService.info(`Games to update: ${data.UpdatedItems.length}`);
			deps.logService.info(`Games to delete: ${data.RemovedItems.length}`);
			// Games to add
			for (const game of data.AddedItems) {
				const exists = deps.playniteGameRepository.exists(game.Id);
				if (exists) {
					deps.logService.info(`Skipping existing game ${game.Name}`);
					continue;
				}
				const result = deps.playniteGameRepository.add(
					{
						Id: game.Id,
						IsInstalled: Number(game.IsInstalled),
						Playtime: game.Playtime,
						Added: game.Added ?? null,
						BackgroundImage: game.BackgroundImage ?? null,
						CoverImage: game.CoverImage ?? null,
						Description: game.Description ?? null,
						Icon: game.Icon ?? null,
						InstallDirectory: game.InstallDirectory ?? null,
						LastActivity: game.LastActivity ?? null,
						Name: game.Name ?? null,
						ReleaseDate: game.ReleaseDate?.ReleaseDate ?? null,
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
				if (!result) {
					deps.logService.error(`Failed to add game ${game.Name}`);
				}
			}
			// Games to update
			for (const game of data.UpdatedItems) {
				const exists = deps.playniteGameRepository.exists(game.Id);
				if (!exists) {
					deps.logService.info(`Skipping game to update ${game.Name}, as it doesn't exist`);
					continue;
				}
				const result = deps.playniteGameRepository.update(
					{
						Id: game.Id,
						IsInstalled: Number(game.IsInstalled),
						Playtime: game.Playtime,
						Added: game.Added ?? null,
						BackgroundImage: game.BackgroundImage ?? null,
						CoverImage: game.CoverImage ?? null,
						Description: game.Description ?? null,
						Icon: game.Icon ?? null,
						InstallDirectory: game.InstallDirectory ?? null,
						LastActivity: game.LastActivity ?? null,
						Name: game.Name ?? null,
						ReleaseDate: game.ReleaseDate?.ReleaseDate ?? null,
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
				if (!result) {
					deps.logService.error(`Failed to update game ${game.Name}`);
				}
			}
			// Games to delete
			for (const gameId of data.RemovedItems) {
				const result = deps.playniteGameRepository.remove(gameId);
				if (!result) {
					deps.logService.error(`Failed to delete game with id ${gameId}`);
				}
				const gameMediaFolderDir = join(deps.FILES_DIR, gameId);
				try {
					await deps.rm(gameMediaFolderDir, { recursive: true, force: true });
					deps.logService.info(`Deleted media folder ${gameMediaFolderDir}`);
				} catch (error) {
					deps.logService.error(
						`Failed to delete media folder ${gameMediaFolderDir}`,
						error as Error
					);
				}
			}
			const totalPlaytimeHours = deps.playniteGameRepository.getTotalPlaytimeHours();
			const totalGamesInLib = deps.playniteGameRepository.getTotal();
			deps.playniteLibrarySyncRepository.add(totalPlaytimeHours ?? 0, totalGamesInLib ?? 0);
			deps.libraryManifestService.write();
			return true;
		} catch (error) {
			deps.logService.error(`Failed to import game list`, error as Error);
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
			deps.logService.debug(`Writing library files to temporary file: ${destPath}...`);
			await deps.pipeline(nodeStream, fileStream);
			deps.logService.debug(`Library files written to temporary file: ${destPath}`);
			const zip = deps.createZip(destPath);
			deps.logService.debug('Extracting library files from zip...');
			zip.extractAllTo(deps.FILES_DIR, true);
			deps.logService.success('Library files extracted successfully');
			const zipEntries = zip.getEntries();
			deps.logService.info(`Extracted ${zipEntries.length} files from zip`);
		} catch (error) {
			deps.logService.error('Failed to extract zip file', error as Error);
			return {
				isValid: false,
				message: 'Failed to extract library files from zip',
				httpCode: 500
			};
		}
		try {
			await unlink(destPath);
			deps.logService.debug(`Temporary zip file removed: ${destPath}`);
		} catch (error) {
			deps.logService.error(`Failed to remove temporary zip file: ${destPath}`, error as Error);
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
		importMediaFiles
	};
};
