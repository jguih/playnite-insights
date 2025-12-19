import {
  ApiError,
  validAuthenticationHeaders,
  type CompletionStatus,
  type IncomingPlayniteGameDTO,
  type Platform,
  type PlayniteGame,
  type PlayniteLibraryMetrics,
} from "@playnite-insights/lib/client";
import busboy from "busboy";
import { createHash } from "crypto";
import { join } from "path";
import { type ReadableStream } from "stream/web";
import {
  type ImportMediaFilesContext,
  type PlayniteLibraryImporterService,
  type PlayniteLibraryImporterServiceDeps,
} from "./service.types";

export const makePlayniteLibraryImporterService = ({
  playniteGameRepository,
  libraryManifestService,
  playniteLibraryMetricsRepository,
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
  const sync: PlayniteLibraryImporterService["sync"] = async (data) => {
    const start = performance.now();
    try {
      logService.info(`Syncing game library...`);
      logService.info(`Games to add: ${data.AddedItems.length}`);
      logService.info(`Games to update: ${data.UpdatedItems.length}`);
      logService.info(`Games to delete: ${data.RemovedItems.length}`);
      const totalGamesToChange =
        data.AddedItems.length +
        data.UpdatedItems.length +
        data.RemovedItems.length;

      const addedOrUpdated = [...data.AddedItems, ...data.UpdatedItems];

      const genres = addedOrUpdated.map((g) => g.Genres ?? []).flat();
      const uniqueGenres = Array.from(
        new Map(genres.map((g) => [g.Id, g])).values()
      );
      uniqueGenres.length > 0 && genreRepository.upsertMany(uniqueGenres);

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
      uniquePlatforms.length > 0 &&
        platformRepository.upsertMany(uniquePlatforms);

      const companies = addedOrUpdated
        .map((g) => [...(g.Publishers ?? []), ...(g.Developers ?? [])])
        .flat();
      const uniqueCompanies = Array.from(
        new Map(companies.map((c) => [c.Id, c])).values()
      );
      uniqueCompanies.length > 0 &&
        companyRepository.upsertMany(uniqueCompanies);

      const completionStatuses: CompletionStatus[] = addedOrUpdated
        .map((g) => g.CompletionStatus)
        .filter((c): c is CompletionStatus => {
          return c !== undefined && c !== null;
        });
      const uniqueCompletionStatuses: CompletionStatus[] = Array.from(
        new Map(completionStatuses.map((c) => [c.Id, c])).values()
      );
      uniqueCompletionStatuses.length > 0 &&
        completionStatusRepository.upsertMany(uniqueCompletionStatuses);

      const gamesToUpsert: PlayniteGame[] = addedOrUpdated.map(
        _fromDtoToPlayniteGame
      );
      gamesToUpsert.length > 0 &&
        playniteGameRepository.upsertMany(gamesToUpsert);

      const gameGenresMap = new Map(
        addedOrUpdated.map((g) => [g.Id, g.Genres?.map((g) => g.Id) ?? []])
      );
      gameGenresMap.size > 0 &&
        playniteGameRepository.updateManyGenres(gameGenresMap);

      const gamePublishersMap = new Map(
        addedOrUpdated.map((g) => [g.Id, g.Publishers?.map((p) => p.Id) ?? []])
      );
      gamePublishersMap.size > 0 &&
        playniteGameRepository.updateManyPublishers(gamePublishersMap);

      const gameDevelopersMap = new Map(
        addedOrUpdated.map((g) => [g.Id, g.Developers?.map((d) => d.Id) ?? []])
      );
      gameDevelopersMap.size > 0 &&
        playniteGameRepository.updateManyDevelopers(gameDevelopersMap);

      const gamePlatformsMap = new Map(
        addedOrUpdated.map((g) => [g.Id, g.Platforms?.map((p) => p.Id) ?? []])
      );
      gamePlatformsMap.size > 0 &&
        playniteGameRepository.updateManyPlatforms(gamePlatformsMap);

      if (data.RemovedItems.length > 0) {
        playniteGameRepository.removeMany(data.RemovedItems);
        let deletedMediaFolders = 0;
        const startDeleteMediaFolders = performance.now();
        for (const gameId of data.RemovedItems) {
          const gameMediaFolderDir = join(FILES_DIR, gameId);
          try {
            await fileSystemService.rm(gameMediaFolderDir, {
              recursive: true,
              force: true,
            });
            deletedMediaFolders++;
          } catch (error) {
            logService.error(
              `Failed to delete media folder ${gameMediaFolderDir}`,
              error as Error
            );
          }
        }
        const startDeleteMediaFoldersDuration =
          performance.now() - startDeleteMediaFolders;
        logService.debug(
          `Finished deleting media folders for ${
            data.RemovedItems.length
          } game(s) in ${startDeleteMediaFoldersDuration.toFixed(1)}ms`
        );
      }

      if (totalGamesToChange > 0) {
        const totalPlaytime = playniteGameRepository.getTotalPlaytimeSeconds();
        const visibleTotalPlaytime =
          playniteGameRepository.getTotalPlaytimeSeconds({
            hidden: false,
          });
        const totalGames = playniteGameRepository.getTotal();
        const visibleTotalGames = playniteGameRepository.getTotal({
          hidden: false,
        });
        const newMetrics: PlayniteLibraryMetrics = {
          Id: 0,
          Timestamp: new Date().toISOString(),
          TotalGames: totalGames,
          TotalPlaytimeSeconds: totalPlaytime,
          VisibleTotalGames: visibleTotalGames,
          VisibleTotalPlaytimeSeconds: visibleTotalPlaytime,
        };
        playniteLibraryMetricsRepository.add(newMetrics);
        await libraryManifestService.write();
      }

      const duration = performance.now() - start;
      logService.success(`Completed library sync in ${duration.toFixed(1)}ms`);
    } catch (error) {
      const duration = performance.now() - start;
      logService.error(`Library sync failed after ${duration.toFixed(1)}ms`);
      throw error;
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
        const bb = busboy({ headers: Object.fromEntries(request.headers) });
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
              throw new ApiError(
                { error: { code: "bad_request" } },
                "No images uploaded",
                400
              );
            if (!ctx.gameId)
              throw new ApiError(
                { error: { code: "bad_request" } },
                "Missing gameId",
                400
              );
            if (!ctx.mediaFilesHash)
              throw new ApiError(
                { error: { code: "bad_request" } },
                "Missing media file hash",
                400
              );

            ctx.game = playniteGameRepository.getById(ctx.gameId) ?? null;
            if (!ctx.game)
              throw new ApiError(
                { error: { code: "not_found" } },
                "Game not found",
                404
              );

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
                { error: { code: "not_authorized" } },
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
