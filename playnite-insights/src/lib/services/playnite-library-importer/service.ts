import { join } from 'path';
import type { ValidationResult } from '$lib/models/validation-result';
import type { FileSystemAsyncDeps, StreamUtilsAsyncDeps } from '../types';
import type { LibraryManifestService } from '../library-manifest/library-manifest';
import type { PlayniteLibrarySyncRepository } from '$lib/services/playnite-library-sync/repository';
import type { PlayniteGameRepository } from '../playnite-game';
import { type SyncGameListCommand } from './schemas';
import busboy from 'busboy';
import type { IncomingHttpHeaders } from 'http';
import { Readable } from 'stream';
import type { PlayniteGame } from '../playnite-game/schemas';
import type { LogService } from '@playnite-insights/services';

type PlayniteLibraryImporterServiceDeps = FileSystemAsyncDeps &
	StreamUtilsAsyncDeps & {
		playniteGameRepository: PlayniteGameRepository;
		libraryManifestService: LibraryManifestService;
		playniteLibrarySyncRepository: PlayniteLibrarySyncRepository;
		logService: LogService;
		FILES_DIR: string;
		TMP_DIR: string;
	};

const readableFromWeb = (webStream: ReadableStream<Uint8Array>): Readable => {
	const reader = webStream.getReader();
	return new Readable({
		async read() {
			const { done, value } = await reader.read();
			if (done) return this.push(null);
			this.push(Buffer.from(value));
		}
	});
};

export const makePlayniteLibraryImporterService = (deps: PlayniteLibraryImporterServiceDeps) => {
	/**
	 * Synchronizes game metadata from Playnite Insights Exporter with the database
	 */
	const sync = async (data: SyncGameListCommand) => {
		try {
			deps.logService.info(`Library sync started`);
			deps.logService.info(`Games to add: ${data.AddedItems.length}`);
			deps.logService.info(`Games to update: ${data.UpdatedItems.length}`);
			deps.logService.info(`Games to delete: ${data.RemovedItems.length}`);
			const start = performance.now();
			const totalGamesToChange =
				data.AddedItems.length + data.UpdatedItems.length + data.RemovedItems.length;
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
				deps.logService.info(`Delete game with id ${gameId}`);
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
			if (totalGamesToChange > 0) {
				const totalPlaytimeHours = deps.playniteGameRepository.getTotalPlaytimeSeconds();
				const totalGamesInLib = deps.playniteGameRepository.getTotal();
				deps.playniteLibrarySyncRepository.add(totalPlaytimeHours ?? 0, totalGamesInLib ?? 0);
				deps.libraryManifestService.write();
			}
			const duration = performance.now() - start;
			deps.logService.success(`Completed library sync in ${duration.toFixed(1)}ms`);
			return true;
		} catch (error) {
			deps.logService.error(`Failed to import game list`, error as Error);
			return false;
		}
	};

	/**
	 *
	 * @param dir
	 * @param game
	 * @throws Error
	 */
	const cleanupUploadDir = async (dir: string, game: PlayniteGame) => {
		try {
			await deps.rm(dir, { force: true, recursive: true });
			await deps.mkdir(dir, { recursive: true });
			deps.logService.debug(`Media folder for ${game?.Name} cleaned up: ${dir}`);
		} catch (error) {
			deps.logService.error(`Failed to clean up media folder ${dir}`, error as Error);
			throw error;
		}
	};

	/**
	 * Imports library files (Playnite media files) from a FormData object.
	 */
	const importMediaFiles = async (request: Request): Promise<ValidationResult<null>> => {
		const headers: IncomingHttpHeaders = Object.fromEntries(request.headers);
		const bb = busboy({ headers });
		let gameId: string | null = null;
		let contentHash: string | null = null;
		let uploadDir: string | null = null;
		let game: PlayniteGame | null = null;
		let fileCount = 0;
		let cleanupPromise: Promise<void> | null = null;
		const filePromises: Promise<void>[] = [];
		const start = performance.now();

		bb.on('field', async (name, val) => {
			if (name === 'gameId' && !cleanupPromise) {
				gameId = val;
				game = deps.playniteGameRepository.getById(gameId) ?? null;
				if (game === null) {
					bb.destroy(new Error(`Game with id ${gameId} not found`));
					return;
				}
				uploadDir = join(deps.FILES_DIR, gameId);
				cleanupPromise = cleanupUploadDir(uploadDir, game).catch((e) => {
					bb.destroy(e);
				});
			}
			if (name === 'contentHash' && uploadDir && cleanupPromise) {
				contentHash = val;
				await cleanupPromise;
				try {
					const contentHashPath = join(uploadDir, 'contentHash.txt');
					await deps.writeFile(contentHashPath, contentHash, 'utf-8');
					deps.logService.debug(
						`contentHash.txt created at ${contentHashPath} with content ${contentHash}`
					);
				} catch (error) {
					deps.logService.error(`Failed to write contentHash.txt file`, error as Error);
					bb.destroy(new Error(`Failed to write contentHash.txt file`));
				}
			}
		});

		bb.on('file', async (fieldname, fileStream, { filename }) => {
			if (!filename || !uploadDir || !cleanupPromise) return fileStream.resume();
			await cleanupPromise;
			const savePath = join(uploadDir, filename);

			const filePromise = new Promise<void>((resolve, reject) => {
				const writeStream = deps.createWriteStream(savePath);
				writeStream.on('finish', () => {
					deps.logService.debug(`Saved file ${savePath} to disk`);
					resolve();
				});
				writeStream.on('error', (error) => {
					deps.logService.error(`Failed to save file ${savePath} to disk`, error);
					reject(error);
				});
				fileStream.pipe(writeStream);
				fileStream.on('end', () => {
					fileCount++;
				});
			});

			filePromises.push(filePromise);
		});

		try {
			await new Promise((resolve, reject) => {
				readableFromWeb(request.body!).pipe(bb);
				bb.on('finish', resolve);
				bb.on('error', reject);
			});
			await Promise.all(filePromises);
			await deps.libraryManifestService.write();
			const duration = performance.now() - start;
			deps.logService.success(
				`Saved ${fileCount} media files to disk for ${game!.Name ?? ''} in ${duration.toFixed(1)}ms`
			);
			return {
				isValid: true,
				message: `Saved ${fileCount} files successfully`,
				httpCode: 200,
				data: null
			};
		} catch (error) {
			deps.logService.error(
				`Error saving files to disk for game with Id: ${gameId}`,
				error as Error
			);
			return {
				isValid: false,
				message: `Error saving files to disk`,
				httpCode: 500
			};
		}
	};

	return {
		sync,
		importMediaFiles
	};
};
