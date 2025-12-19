import {
  type FileSystemService,
  type LogService,
} from "@playatlas/common/application";
import { SystemConfig } from "@playatlas/system/infra";
import busboy from "busboy";
import { join } from "path";
import { Readable } from "stream";
import type { ReadableStream } from "stream/web";
import { makePlayniteMediaFilesContext } from "../domain/playnite-media-files-context.entity";
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
      const context = makePlayniteMediaFilesContext({ tmpDirPath: tmpDir });

      await fileSystemService.mkdir(tmpDir, { recursive: true });

      const streamPromise = new Promise<void>((resolve) => {
        const mediaFilesPromises: Promise<PlayniteMediaFileStreamResult>[] = [];
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
          const filePromise = new Promise<PlayniteMediaFileStreamResult>(
            (resolve, reject) => {
              const writeStream =
                fileSystemService.createWriteStream(tmpFilePath);
              writeStream.on("finish", () =>
                resolve({ filename, filepath: tmpFilePath })
              );
              writeStream.on("error", reject);
              fileStream.pipe(writeStream);
              fileStream.on("end", () => {
                uploadCount++;
              });
            }
          );
          mediaFilesPromises.push(filePromise);
        });

        bb.on("finish", async () => {
          const results = await Promise.all(mediaFilesPromises);
          context.setStreamResults(results);
          context.validate();
          logService.info(
            `${requestDescription}: Downloaded ${uploadCount} files to temporary location ${tmpDir}`
          );
          resolve();
        });

        stream.pipe(bb);
      });

      await streamPromise;

      return context;
    };

  return { streamMultipartToTempFolder };
};
