import {
  ApiError,
  validAuthenticationHeaders,
  type CompletionStatus,
  type IncomingPlayniteGameDTO,
  type Platform,
  type PlayniteGame,
  type SyncGameListCommand,
} from "@playnite-insights/lib/client";
import busboy from "busboy";
import { createHash } from "crypto";
import type { IncomingHttpHeaders } from "http";
import { join } from "path";
import { ReadableStream } from "stream/web";
import {
  type ImportMediaFilesContext,
  type PlayniteLibraryImporterService,
  type PlayniteLibraryImporterServiceDeps,
} from "./service.types";

export const makePlayniteLibraryImporterService = ({
  playniteGameRepository,
  libraryManifestService,
  playniteLibrarySyncRepository,
  gameSessionRepository,
  fileSystemService,
  streamUtilsService,
  logService,
  FILES_DIR,
  TMP_DIR,
  completionStatusRepository,
  genreRepository,
  platformRepository,
  companyRepository,
}: PlayniteLibraryImporterServiceDeps): PlayniteLibraryImporterService => {
  const _fromDtoToPlayniteGame = (
    game: IncomingPlayniteGameDTO
  ): PlayniteGame => {
    return {
      Id: game.Id,
      IsInstalled: +game.IsInstalled,
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
      Hidden: +game.Hidden,
      CompletionStatusId: game.CompletionStatus?.Id ?? null,
      ContentHash: game.ContentHash,
    };
  };

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

      const addedOrUpdated = [...data.AddedItems, ...data.UpdatedItems];

      const genres = addedOrUpdated.map((g) => g.Genres ?? []).flat();
      const uniqueGenres = Array.from(
        new Map(genres.map((g) => [g.Id, g])).values()
      );
      genreRepository.upsertMany(uniqueGenres);

      const platforms = addedOrUpdated
        .map((g) => g.Platforms ?? [])
        .flat()
        .map((p) => {
          return {
            Id: p.Id,
            SpecificationId: p.SpecificationId,
            Name: p.Name,
            Background: p.Background ?? null,
            Cover: p.Cover ?? null,
            Icon: p.Icon ?? null,
          } as Platform;
        });
      const uniquePlatforms = Array.from(
        new Map(platforms.map((p) => [p.Id, p])).values()
      );
      platformRepository.upsertMany(uniquePlatforms);

      const companies = addedOrUpdated
        .map((g) => [...(g.Publishers ?? []), ...(g.Developers ?? [])])
        .flat();
      const uniqueCompanies = Array.from(
        new Map(companies.map((c) => [c.Id, c])).values()
      );
      companyRepository.upsertMany(uniqueCompanies);

      const completionStatuses: CompletionStatus[] = addedOrUpdated
        .map((g) => g.CompletionStatus)
        .filter((c): c is CompletionStatus => {
          return c !== undefined && c !== null;
        });
      const uniqueCompletionStatuses: CompletionStatus[] = Array.from(
        new Map(completionStatuses.map((c) => [c.Id, c])).values()
      );
      completionStatusRepository.upsertMany(uniqueCompletionStatuses);

      const gamesToUpsert: PlayniteGame[] = addedOrUpdated.map(
        _fromDtoToPlayniteGame
      );
      playniteGameRepository.upsertMany(gamesToUpsert);

      const gameGenresMap = new Map(
        addedOrUpdated.map((g) => [g.Id, g.Genres?.map((g) => g.Id) ?? []])
      );
      playniteGameRepository.updateManyGenres(gameGenresMap);

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

  const _getImportMediaFilesContext = (): ImportMediaFilesContext => {
    const requestId = crypto.randomUUID();
    return {
      requestId: crypto.randomUUID(),
      tmpDir: join(TMP_DIR, requestId),
      gameId: null,
      game: null,
      mediaFilesHash: null,
      uploadCount: 0,
      filesToHash: [],
      filePromises: [],
    };
  };

  /**
   * Downloads Playnite library media files from the request
   */
  const importMediaFiles: PlayniteLibraryImporterService["importMediaFiles"] =
    async (request, url) => {
      return new Promise(async (resolve, reject) => {
        const requestDescription = `${request.method} ${url.pathname}`;
        const headers: IncomingHttpHeaders = Object.fromEntries(
          request.headers as unknown as Iterable<string[]>
        );
        const bb = busboy({ headers });
        const stream = streamUtilsService.readableFromWeb(
          request.body! as unknown as ReadableStream
        );
        const ctx: ImportMediaFilesContext = _getImportMediaFilesContext();
        const contentHash = request.headers.get(
          validAuthenticationHeaders["X-ContentHash"]
        );
        const start = performance.now();

        try {
          await fileSystemService.mkdir(ctx.tmpDir, { recursive: true });
        } catch (error) {
          reject(error);
        }

        bb.on("field", async (name, val) => {
          if (name === "gameId") {
            ctx.gameId = val;
          }
          if (name === "contentHash") {
            ctx.mediaFilesHash = val;
          }
        });

        bb.on("file", async (_, fileStream, { filename }) => {
          const tmpFilePath = join(ctx.tmpDir, filename);

          const filePromise = new Promise<string>((resolve, reject) => {
            const writeStream =
              streamUtilsService.createWriteStream(tmpFilePath);
            writeStream.on("finish", () => {
              logService.debug(`Saved file ${tmpFilePath} to disk`);
              resolve(tmpFilePath);
            });
            writeStream.on("error", (error) => {
              logService.error(
                `Failed to save file ${tmpFilePath} to disk`,
                error
              );
              reject(error);
            });
            const chunks: Buffer[] = [];
            fileStream.on("data", (chunk) => chunks.push(chunk));
            fileStream.pipe(writeStream);
            fileStream.on("end", () => {
              ctx.filesToHash.push({ filename, buffer: Buffer.concat(chunks) });
              ctx.uploadCount++;
            });
          });

          ctx.filePromises.push(filePromise);
        });

        bb.on("finish", async () => {
          try {
            await Promise.all(ctx.filePromises);

            if (ctx.uploadCount === 0)
              throw new ApiError("No images uploaded", 400);
            if (!ctx.gameId) throw new ApiError("Missing gameId", 400);
            if (!ctx.mediaFilesHash)
              throw new ApiError("Missing media file hash", 400);

            ctx.game = playniteGameRepository.getById(ctx.gameId) ?? null;
            if (!ctx.game) throw new ApiError("Game not found", 404);

            const canonicalHash = createHash("sha256");
            canonicalHash.update(Buffer.from(ctx.gameId, "utf-8"));
            canonicalHash.update(Buffer.from(ctx.mediaFilesHash, "utf-8"));
            ctx.filesToHash.sort((a, b) =>
              a.filename.localeCompare(b.filename, undefined, {
                sensitivity: "variant",
              })
            );
            for (const file of ctx.filesToHash) {
              canonicalHash.update(file.buffer);
            }
            const canonicalDigest = canonicalHash.digest("base64");

            if (canonicalDigest !== contentHash) {
              logService.warning(
                `${requestDescription}: Request rejected bacause calculated content hash does not match received one`
              );
              throw new ApiError(
                "Request rejected bacause calculated content hash does not match received one",
                403
              );
            }

            // Save media files hash into a file
            const contentHashPath = join(ctx.tmpDir, "contentHash.txt");
            await fileSystemService.writeFile(
              contentHashPath,
              ctx.mediaFilesHash,
              "utf-8"
            );
            // Transfer files from temporary to upload dir
            const uploadDir = join(FILES_DIR, ctx.gameId);
            await fileSystemService.rm(uploadDir, {
              recursive: true,
              force: true,
            });
            await fileSystemService.rename(ctx.tmpDir, uploadDir);
            logService.debug(
              `Moved all files in ${ctx.tmpDir} to ${uploadDir}`
            );

            await libraryManifestService.write();
            const duration = performance.now() - start;
            logService.success(
              `Saved ${ctx.uploadCount} media files to disk for ${
                ctx.game!.Name ?? ""
              } in ${duration.toFixed(1)}ms`
            );
            resolve();
          } catch (error) {
            try {
              await fileSystemService.rm(ctx.tmpDir, {
                recursive: true,
                force: true,
              });
            } catch {}
            bb.destroy(error as Error);
            reject(error);
          }
        });

        bb.on("error", (error) => {
          reject(error);
        });

        stream.pipe(bb);
      });
    };

  return {
    sync,
    importMediaFiles,
  };
};
