import {
  type FileSystemService,
  type LogService,
} from "@playatlas/common/application";
import { InvalidFileTypeError } from "@playatlas/common/domain";
import { SystemConfig } from "@playatlas/system/infra";
import busboy from "busboy";
import { join } from "path";
import sharp from "sharp";
import { Readable } from "stream";
import type { ReadableStream } from "stream/web";
import { makePlayniteMediaFilesContext } from "./playnite-media-files-context";
import { PlayniteMediaFilesHandler } from "./playnite-media-files-handler.port";
import { PlayniteMediaFileStreamResult } from "./playnite-media-files-handler.types";

export type PlayniteMediaFilesHandlerDeps = {
  fileSystemService: FileSystemService;
  logService: LogService;
  getTmpDir: SystemConfig["getTmpDir"];
};

export const makePlayniteMediaFilesHandler = ({
  logService,
  fileSystemService,
  getTmpDir,
}: PlayniteMediaFilesHandlerDeps): PlayniteMediaFilesHandler => {
  const streamMultipartToTempFolder: PlayniteMediaFilesHandler["streamMultipartToTempFolder"] =
    async (request) => {
      const requestDescription = logService.getRequestDescription(request);
      const requestId = crypto.randomUUID();
      const tmpDir = join(getTmpDir(), requestId);
      const bb = busboy({ headers: Object.fromEntries(request.headers) });
      const stream = Readable.fromWeb(
        request.body! as ReadableStream<Uint8Array>
      );
      const context = makePlayniteMediaFilesContext(
        { fileSystemService },
        { tmpDirPath: tmpDir }
      );
      let handedOff = false;

      try {
        await fileSystemService.mkdir(tmpDir, { recursive: true });

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

          bb.on("file", async (_, fileStream, { filename }) => {
            const tmpFilePath = join(tmpDir, filename);
            logService.debug(
              `${requestDescription}: Saving file ${filename} to ${tmpFilePath}`
            );

            const filePromise = new Promise<PlayniteMediaFileStreamResult>(
              (resolve, reject) => {
                const writeStream =
                  fileSystemService.createWriteStream(tmpFilePath);
                writeStream.on("finish", () => {
                  logService.debug(
                    `${requestDescription}: File ${tmpFilePath} saved successfully`
                  );
                  resolve({ filename, filepath: tmpFilePath });
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

              for (const { filepath } of results) {
                try {
                  await sharp(filepath).metadata();
                } catch {
                  throw new InvalidFileTypeError(
                    `Uploaded file ${filepath} is not a valid image`
                  );
                }
              }

              context.setStreamResults(results);
              context.validate();
              logService.info(
                `${requestDescription}: Downloaded ${uploadCount} files to temporary location ${tmpDir}`
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

        handedOff = true;
        return context;
      } catch (error) {
        await context.dispose();
        throw error;
      } finally {
        if (!handedOff) await context.dispose();
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

  return { streamMultipartToTempFolder, withMediaFilesContext };
};
