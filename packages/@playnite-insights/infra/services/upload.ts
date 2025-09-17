import type {
  FileSystemService,
  ImageRepository,
  LogService,
  StreamUtilsService,
  UploadService,
} from "@playnite-insights/core";
import { AppError } from "@playnite-insights/lib/client";
import busboy from "busboy";
import { createHash } from "crypto";
import type { IncomingHttpHeaders } from "http";
import { extname, join } from "path";
import sharp from "sharp";
import { ReadableStream } from "stream/web";
import { config } from "../config";
import { defaultImageRepository } from "../repository/image";
import { defaultFileSystemService } from "./file-system";
import { defaultLogger } from "./log";
import { defaultStreamUtilsService } from "./stream-utils";

export type UploadServiceDeps = {
  streamUtilsService: StreamUtilsService;
  fileSystemService: FileSystemService;
  logService: LogService;
  imageRepository: ImageRepository;
  TMP_DIR: string;
};

export const makeUploadService = (
  deps: Partial<UploadServiceDeps> = {}
): UploadService => {
  const {
    streamUtilsService,
    logService,
    fileSystemService,
    imageRepository,
    TMP_DIR,
  }: UploadServiceDeps = {
    streamUtilsService: defaultStreamUtilsService,
    logService: defaultLogger,
    fileSystemService: defaultFileSystemService,
    imageRepository: defaultImageRepository,
    TMP_DIR: config.TMP_DIR,
    ...deps,
  };

  const uploadImageAsync: UploadService["uploadImagesAsync"] = async (
    request,
    path,
    source
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
        logService.warning(
          `Image upload rejected due to incorrect extension ${ext} or mimeType`
        );
        fileStream.resume();
        return;
      }

      const uniqueFileName = `${crypto.randomUUID()}${ext}`;
      const uploadPath = join(path, uniqueFileName);
      const tmpPath = join(TMP_DIR, uniqueFileName);

      const filePromise = new Promise<string>((resolve, reject) => {
        const writeStream = streamUtilsService.createWriteStream(tmpPath);
        const hash = createHash("sha256");

        writeStream.on("finish", async () => {
          try {
            const checksum = hash.digest("hex");

            const existing = imageRepository.getByChecksum(checksum);
            if (existing) {
              await fileSystemService.unlink(tmpPath);
              logService.info(
                `Image file already exists: ${existing.FilePath}`
              );
              return resolve(existing.FileName);
            }

            await fileSystemService.rename(tmpPath, uploadPath);
            logService.debug(`Image file at ${tmpPath} moved to ${uploadPath}`);

            const metadata = await sharp(uploadPath).metadata();
            const stats = await fileSystemService.stat(uploadPath);

            imageRepository.add({
              CheckSum: checksum,
              CreatedAt: new Date().toISOString(),
              DeletedAt: null,
              FileExtension: ext,
              FileName: uniqueFileName,
              FilePath: uploadPath,
              FileSize: stats.size,
              Height: metadata.height,
              Width: metadata.width,
              MimeType: mimeType,
              Source: source,
            });

            resolve(uniqueFileName);
          } catch (error) {
            try {
              await fileSystemService.unlink(tmpPath);
            } catch {}
            reject(error);
          }
        });

        writeStream.on("error", (error) => {
          reject(error);
        });

        fileStream.on("data", (chunk) => hash.update(chunk));
        fileStream.pipe(writeStream);
        fileStream.on("end", () => {
          uploadCount++;
        });
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
      logService.info(
        `Upload image finished in ${duration.toFixed(
          1
        )}ms, ${uploadCount} image(s) were processed`
      );
      return paths;
    });
  };

  return { uploadImagesAsync: uploadImageAsync };
};
