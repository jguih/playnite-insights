import type {
  FileSystemService,
  LogService,
  StreamUtilsService,
  UploadService,
} from "@playnite-insights/core";
import { AppError } from "@playnite-insights/lib/client";
import busboy from "busboy";
import type { IncomingHttpHeaders } from "http";
import { extname, join } from "path";
import { ReadableStream } from "stream/web";
import { defaultFileSystemService } from "./file-system";
import { defaultLogger } from "./log";
import { defaultStreamUtilsService } from "./stream-utils";

export type UploadServiceDeps = {
  streamUtilsService: StreamUtilsService;
  fileSystemService: FileSystemService;
  logService: LogService;
};

export const makeUploadService = (
  deps: Partial<UploadServiceDeps> = {}
): UploadService => {
  const {
    streamUtilsService,
    logService,
    fileSystemService,
  }: UploadServiceDeps = {
    streamUtilsService: defaultStreamUtilsService,
    logService: defaultLogger,
    fileSystemService: defaultFileSystemService,
    ...deps,
  };

  const uploadImageAsync: UploadService["uploadImagesAsync"] = async (
    request,
    path
  ) => {
    if (!request.body) {
      throw new AppError("Empty request body");
    }

    const headers: IncomingHttpHeaders = Object.fromEntries(
      request.headers as unknown as Iterable<string[]>
    );
    const bb = busboy({ headers });
    const filePromises: Promise<string>[] = [];
    const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    let uploadCount: number = 0;
    const start = performance.now();

    await fileSystemService.mkdir(path, { recursive: true });

    bb.on("file", async (_, fileStream, { filename, mimeType }) => {
      const ext = extname(filename).toLowerCase();
      if (!allowedExts.includes(ext) || !mimeType.startsWith("image/")) {
        fileStream.resume();
        return;
      }

      const uniqueFileName = `${crypto.randomUUID()}${ext}`;
      const uploadPath = join(path, uniqueFileName);

      const filePromise = new Promise<string>((resolve, reject) => {
        const writeStream = streamUtilsService.createWriteStream(uploadPath);
        writeStream.on("finish", () => {
          logService.debug(`Saved file ${uploadPath} to disk`);
          resolve(uploadPath);
        });
        writeStream.on("error", (error) => {
          reject(error);
        });
        fileStream.pipe(writeStream);
        fileStream.on("end", () => uploadCount++);
      });
      filePromises.push(filePromise);
    });

    await new Promise((resolve, reject) => {
      streamUtilsService
        .readableFromWeb(request.body as ReadableStream)
        .pipe(bb);
      bb.on("finish", resolve);
      bb.on("error", reject);
    });

    return Promise.all(filePromises).then((paths) => {
      const duration = performance.now() - start;
      logService.success(
        `Saved ${uploadCount} image(s) in ${duration.toFixed(1)}ms`
      );
      return paths;
    });
  };

  return { uploadImagesAsync: uploadImageAsync };
};
