import { join } from "path";
import type { IncomingHttpHeaders } from "http";
import {
  PlayniteGame,
  SyncGameListCommand,
  ValidationResult,
} from "@playnite-insights/lib";
import { ReadableStream } from "stream/web";
import {
  PlayniteLibraryImporterService,
  PlayniteLibraryImporterServiceDeps,
} from "./service.types";
import busboy from "busboy";

export const makePlayniteLibraryImporterService = ({
  playniteGameRepository,
  libraryManifestService,
  playniteLibrarySyncRepository,
  gameSessionRepository,
  fileSystemService,
  streamUtilsService,
  logService,
  FILES_DIR,
}: PlayniteLibraryImporterServiceDeps): PlayniteLibraryImporterService => {
  /**
   * Synchronizes game metadata from Playnite Insights Exporter with the database
   */
  const sync = async (data: SyncGameListCommand) => {
    try {
      logService.info(`Library sync started`);
      logService.info(`Games to add: ${data.AddedItems.length}`);
      logService.info(`Games to update: ${data.UpdatedItems.length}`);
      logService.info(`Games to delete: ${data.RemovedItems.length}`);
      const start = performance.now();
      const totalGamesToChange =
        data.AddedItems.length +
        data.UpdatedItems.length +
        data.RemovedItems.length;
      // Games to add
      for (const game of data.AddedItems) {
        const exists = playniteGameRepository.exists(game.Id);
        if (exists) {
          logService.info(`Skipping existing game ${game.Name}`);
          continue;
        }
        const result = playniteGameRepository.add(
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
            ContentHash: game.ContentHash,
          },
          game.Developers ?? [],
          game.Platforms?.map((plat) => {
            return {
              Id: plat.Id,
              Name: plat.Name,
              SpecificationId: plat.SpecificationId,
              Background: plat.Background ?? null,
              Cover: plat.Cover ?? null,
              Icon: plat.Icon ?? null,
            };
          }),
          game.Genres ?? [],
          game.Publishers ?? []
        );
        if (!result) {
          logService.error(`Failed to add game ${game.Name}`);
        }
      }
      // Games to update
      for (const game of data.UpdatedItems) {
        const exists = playniteGameRepository.exists(game.Id);
        if (!exists) {
          logService.info(
            `Skipping game to update ${game.Name}, as it doesn't exist`
          );
          continue;
        }
        const result = playniteGameRepository.update(
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
            ContentHash: game.ContentHash,
          },
          game.Developers ?? [],
          game.Platforms?.map((plat) => {
            return {
              Id: plat.Id,
              Name: plat.Name,
              SpecificationId: plat.SpecificationId,
              Background: plat.Background ?? null,
              Cover: plat.Cover ?? null,
              Icon: plat.Icon ?? null,
            };
          }),
          game.Genres ?? [],
          game.Publishers ?? []
        );
        if (!result) {
          logService.error(`Failed to update game ${game.Name}`);
        }
      }
      // Games to delete
      for (const gameId of data.RemovedItems) {
        const game = playniteGameRepository.getById(gameId);
        if (!game) {
          logService.warning(
            `Skipping deleting non existing game with id ${gameId}`
          );
          continue;
        }
        if (!gameSessionRepository.unlinkSessionsForGame(gameId)) continue;
        if (!playniteGameRepository.remove(gameId)) continue;
        logService.info(`Deleted game ${game.Name}`);
        const gameMediaFolderDir = join(FILES_DIR, gameId);
        try {
          await fileSystemService.rm(gameMediaFolderDir, {
            recursive: true,
            force: true,
          });
          logService.info(
            `Deleted media folder ${gameMediaFolderDir} for ${game.Name}`
          );
        } catch (error) {
          logService.error(
            `Failed to delete media folder ${gameMediaFolderDir} for ${game.Name}`,
            error as Error
          );
        }
      }
      if (totalGamesToChange > 0) {
        const totalPlaytimeHours =
          playniteGameRepository.getTotalPlaytimeSeconds();
        const totalGamesInLib = playniteGameRepository.getTotal();
        playniteLibrarySyncRepository.add(
          totalPlaytimeHours ?? 0,
          totalGamesInLib ?? 0
        );
        await libraryManifestService.write();
      }
      const duration = performance.now() - start;
      logService.success(`Completed library sync in ${duration.toFixed(1)}ms`);
      return true;
    } catch (error) {
      logService.error(`Failed to import game list`, error as Error);
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
      await fileSystemService.rm(dir, { force: true, recursive: true });
      await fileSystemService.mkdir(dir, { recursive: true });
      logService.debug(`Media folder for ${game?.Name} cleaned up: ${dir}`);
    } catch (error) {
      logService.error(
        `Failed to clean up media folder ${dir}`,
        error as Error
      );
      throw error;
    }
  };

  /**
   * Imports library files (Playnite media files) from a FormData object.
   */
  const importMediaFiles = async (
    request: Request
  ): Promise<ValidationResult<null>> => {
    const headers: IncomingHttpHeaders = Object.fromEntries(
      request.headers as unknown as Iterable<string[]>
    );
    const bb = busboy({ headers });
    let gameId: string | null = null;
    let contentHash: string | null = null;
    let uploadDir: string | null = null;
    let game: PlayniteGame | null = null;
    let fileCount = 0;
    let cleanupPromise: Promise<void> | null = null;
    const filePromises: Promise<void>[] = [];
    const start = performance.now();

    bb.on("field", async (name, val) => {
      if (name === "gameId" && !cleanupPromise) {
        gameId = val;
        game = playniteGameRepository.getById(gameId) ?? null;
        if (game === null) {
          bb.destroy(new Error(`Game with id ${gameId} not found`));
          return;
        }
        uploadDir = join(FILES_DIR, gameId);
        cleanupPromise = cleanupUploadDir(uploadDir, game).catch((e) => {
          bb.destroy(e);
        });
      }
      if (name === "contentHash" && uploadDir && cleanupPromise) {
        contentHash = val;
        await cleanupPromise;
        try {
          const contentHashPath = join(uploadDir, "contentHash.txt");
          await fileSystemService.writeFile(
            contentHashPath,
            contentHash,
            "utf-8"
          );
          logService.debug(
            `contentHash.txt created at ${contentHashPath} with content ${contentHash}`
          );
        } catch (error) {
          logService.error(
            `Failed to write contentHash.txt file`,
            error as Error
          );
          bb.destroy(new Error(`Failed to write contentHash.txt file`));
        }
      }
    });

    bb.on("file", async (fieldname, fileStream, { filename }) => {
      if (!filename || !uploadDir || !cleanupPromise)
        return fileStream.resume();
      await cleanupPromise;
      const savePath = join(uploadDir, filename);

      const filePromise = new Promise<void>((resolve, reject) => {
        const writeStream = streamUtilsService.createWriteStream(savePath);
        writeStream.on("finish", () => {
          logService.debug(`Saved file ${savePath} to disk`);
          resolve();
        });
        writeStream.on("error", (error) => {
          logService.error(`Failed to save file ${savePath} to disk`, error);
          reject(error);
        });
        fileStream.pipe(writeStream);
        fileStream.on("end", () => {
          fileCount++;
        });
      });

      filePromises.push(filePromise);
    });

    try {
      await new Promise((resolve, reject) => {
        streamUtilsService
          .readableFromWeb(request.body! as unknown as ReadableStream)
          .pipe(bb);
        bb.on("finish", resolve);
        bb.on("error", reject);
      });
      await Promise.all(filePromises);
      await libraryManifestService.write();
      const duration = performance.now() - start;
      logService.success(
        `Saved ${fileCount} media files to disk for ${
          game!.Name ?? ""
        } in ${duration.toFixed(1)}ms`
      );
      return {
        isValid: true,
        message: `Saved ${fileCount} files successfully`,
        httpCode: 200,
        data: null,
      };
    } catch (error) {
      logService.error(
        `Error saving files to disk for game with Id: ${gameId}`,
        error as Error
      );
      return {
        isValid: false,
        message: `Error saving files to disk`,
        httpCode: 500,
      };
    }
  };

  return {
    sync,
    importMediaFiles,
  };
};
