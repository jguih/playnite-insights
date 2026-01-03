import {
  type FileSystemService,
  type LogService,
  type LogServiceFactory,
} from "@playatlas/common/application";
import { InvalidFileTypeError } from "@playatlas/common/domain";
import type { SystemConfig } from "@playatlas/system/infra";
import busboy from "busboy";
import { createHash, Hash, timingSafeEqual } from "crypto";
import { once } from "events";
import { basename, extname, join } from "path";
import sharp from "sharp";
import { Readable } from "stream";
import type { ReadableStream } from "stream/web";
import { makePlayniteMediaFilesContext } from "./playnite-media-files-context";
import {
  CONTENT_HASH_FILE_NAME,
  isValidFileName,
  MEDIA_PRESETS,
} from "./playnite-media-files-handler.constants";
import type { PlayniteMediaFilesHandler } from "./playnite-media-files-handler.port";
import type { PlayniteMediaFileStreamResult } from "./playnite-media-files-handler.types";

export type PlayniteMediaFilesHandlerDeps = {
  fileSystemService: FileSystemService;
  logService: LogService;
  logServiceFactory: LogServiceFactory;
  systemConfig: SystemConfig;
};

export const makePlayniteMediaFilesHandler = ({
  logService,
  logServiceFactory,
  fileSystemService,
  systemConfig,
}: PlayniteMediaFilesHandlerDeps): PlayniteMediaFilesHandler => {
  const _validateImages = async (filepaths: string[]) => {
    for (const filepath of filepaths) {
      try {
        await sharp(filepath).metadata();
      } catch {
        throw new InvalidFileTypeError(
          `Uploaded file ${filepath} is not a valid image`
        );
      }
    }
  };

  const _streamFileIntoHash = async (hash: Hash, filepath: string) => {
    const stream = fileSystemService.createReadStream(filepath);

    stream.on("data", (chunk) => {
      hash.update(chunk);
    });

    await once(stream, "end");
  };

  const _deriveIconFromCover = async (
    coverPath: string,
    outputPath: string
  ): Promise<PlayniteMediaFileStreamResult> => {
    const preset = MEDIA_PRESETS.icon;
    const image = sharp(coverPath);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error("Invalid cover image");
    }

    const side = Math.min(metadata.width, metadata.height);

    const left = Math.floor((metadata.width - side) / 2);
    const top = Math.floor((metadata.height - side) / 2);

    await image
      .extract({
        left,
        top,
        width: side,
        height: side,
      })
      .resize(preset.w, preset.h)
      .webp({
        quality: preset.q,
        effort: 4,
        smartSubsample: true,
      })
      .toFile(outputPath);

    logService.debug(`Derived icon image from cover at ${coverPath}`);
    return {
      name: "icon",
      filename: basename(outputPath),
      filepath: outputPath,
    };
  };

  const streamMultipartToTempFolder: PlayniteMediaFilesHandler["streamMultipartToTempFolder"] =
    async (request) => {
      const bb = busboy({ headers: Object.fromEntries(request.headers) });
      const stream = Readable.fromWeb(
        request.body! as ReadableStream<Uint8Array>
      );
      const contentHashHeader = request.headers.get("X-ContentHash");
      const context = makePlayniteMediaFilesContext(
        {
          fileSystemService,
          logService: logServiceFactory.build("PlayniteMediaFilesContext"),
          systemConfig,
        },
        { contentHashHeader }
      );
      let handedContext = false;

      try {
        await context.init();

        await new Promise<void>((resolve, reject) => {
          const mediaFilesPromises: Promise<PlayniteMediaFileStreamResult>[] =
            [];
          let uploadCount: number = 0;

          bb.on("field", async (name, val) => {
            if (name === "gameId") {
              context.setGameId(val);
            }
            if (name === "contentHash") {
              context.setContentHash(val);
            }
          });

          bb.on("file", async (name, fileStream, { filename }) => {
            if (!isValidFileName(name)) {
              logService.warning(
                `Rejecting file ${filename} due to incorrect file name ${name}`
              );
              fileStream.resume();
              return;
            }
            const filepath = join(context.getTmpDirPath(), filename);
            logService.debug(`Saving file ${filename} to ${filepath}`);

            const filePromise = new Promise<PlayniteMediaFileStreamResult>(
              (resolve, reject) => {
                const writeStream =
                  fileSystemService.createWriteStream(filepath);
                writeStream.on("finish", () => {
                  logService.debug(`File ${filepath} saved successfully`);
                  resolve({ name, filename, filepath });
                });
                writeStream.on("error", reject);

                fileStream.pipe(writeStream);
                fileStream.on("error", reject);
                fileStream.on("end", () => {
                  uploadCount++;
                });
              }
            );
            mediaFilesPromises.push(filePromise);
          });

          bb.on("finish", async () => {
            try {
              const results = await Promise.all(mediaFilesPromises);

              await _validateImages(results.map((r) => r.filepath));

              context.setStreamResults(results);
              context.validate();
              logService.info(
                `Downloaded ${uploadCount} files to temporary location ${context.getTmpDirPath()}`
              );
              resolve();
            } catch (error) {
              reject(error);
            }
          });

          bb.on("error", reject);
          stream.on("error", reject);

          stream.pipe(bb);
        });

        handedContext = true;
        return context;
      } catch (error) {
        await context.dispose();
        throw error;
      } finally {
        if (!handedContext) await context.dispose();
      }
    };

  const withMediaFilesContext: PlayniteMediaFilesHandler["withMediaFilesContext"] =
    async (request, cb) => {
      const context = await streamMultipartToTempFolder(request);

      try {
        return await cb(context);
      } finally {
        await context.dispose();
      }
    };

  const verifyIntegrity: PlayniteMediaFilesHandler["verifyIntegrity"] = async (
    context
  ) => {
    context.validate();

    const SEP = Buffer.from([0]);
    const canonicalHash = createHash("sha256");

    canonicalHash.update(Buffer.from(context.getGameId(), "utf-8"));
    canonicalHash.update(SEP);
    canonicalHash.update(Buffer.from(context.getContentHash(), "utf-8"));
    canonicalHash.update(SEP);

    const files = [...context.getStreamResults()].sort((a, b) =>
      a.filename.localeCompare(b.filename, undefined, {
        sensitivity: "variant",
      })
    );

    for (const { filename, filepath } of files) {
      canonicalHash.update(Buffer.from(filename, "utf-8"));
      canonicalHash.update(SEP);

      await _streamFileIntoHash(canonicalHash, filepath);
      canonicalHash.update(SEP);
    }

    const canonicalDigest = canonicalHash.digest();
    const headerDigest = Buffer.from(context.getContentHashHeader(), "base64");

    if (canonicalDigest.length !== headerDigest.length) {
      return false;
    }

    return timingSafeEqual(canonicalDigest, headerDigest);
  };

  const processImages: PlayniteMediaFilesHandler["processImages"] = async (
    context
  ) => {
    context.validate();

    await fileSystemService.mkdir(context.getTmpOptimizedDirPath(), {
      recursive: true,
    });

    const results = await Promise.all(
      context.getStreamResults().map(async ({ name, filepath, filename }) => {
        const preset = MEDIA_PRESETS[name];
        const outputFilename = basename(filename, extname(filename)) + ".webp";
        const outputPath = join(
          context.getTmpOptimizedDirPath(),
          outputFilename
        );

        return sharp(filepath, { failOn: "none" })
          .rotate()
          .resize({
            width: preset.w,
            height: preset.h,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({
            quality: preset.q,
            effort: 4,
            smartSubsample: true,
          })
          .toFile(outputPath)
          .then(() => {
            logService.debug(
              `Optimized image ${outputPath} using preset ${JSON.stringify(
                preset
              )}`
            );
            return {
              name,
              filename: outputFilename,
              filepath: outputPath,
            } as PlayniteMediaFileStreamResult;
          });
      })
    );

    const cover = results.find((r) => r.name === "cover");
    if (!results.find((r) => r.name === "icon") && cover) {
      const outputPath = join(
        context.getTmpOptimizedDirPath(),
        `${crypto.randomUUID()}.webp`
      );
      const result = await _deriveIconFromCover(cover.filepath, outputPath);
      results.push(result);
    }

    return results;
  };

  const moveProcessedImagesToGameFolder: PlayniteMediaFilesHandler["moveProcessedImagesToGameFolder"] =
    async (context) => {
      context.validate();
      await context.ensureGameDir({ cleanUp: true });
      await fileSystemService.rename(
        context.getTmpOptimizedDirPath(),
        context.getGameDirPath()
      );
      logService.debug(
        `Moved temporary files at ${context.getTmpOptimizedDirPath()} to game media files location ${context.getGameDirPath()}`
      );
    };

  const writeContentHashFileToGameFolder: PlayniteMediaFilesHandler["writeContentHashFileToGameFolder"] =
    async (context) => {
      context.validate();
      await context.ensureGameDir();
      const filepath = join(context.getGameDirPath(), CONTENT_HASH_FILE_NAME);
      await fileSystemService.writeFile(
        filepath,
        context.getContentHash(),
        "utf-8"
      );
    };

  return {
    streamMultipartToTempFolder,
    withMediaFilesContext,
    verifyIntegrity,
    processImages,
    moveProcessedImagesToGameFolder,
    writeContentHashFileToGameFolder,
  };
};
