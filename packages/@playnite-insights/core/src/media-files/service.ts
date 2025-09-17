import { Image, validImageSources } from "@playnite-insights/lib/client";
import { extname, join } from "path";
import type { MediaFilesService, MediaFilesServiceDeps } from "./service.types";

export const makeMediaFilesService = ({
  logService,
  fileSystemService,
  FILES_DIR,
  SCREENSHOTS_DIR,
  uploadService,
}: MediaFilesServiceDeps): MediaFilesService => {
  const checkIfImageExists = async (imagePath: string): Promise<boolean> => {
    try {
      await fileSystemService.access(
        imagePath,
        fileSystemService.constants.F_OK
      );
      return true;
    } catch {
      return false;
    }
  };

  const getImageStats = async (
    imagePath: string
  ): Promise<{ lastModified: string; etag: string } | null> => {
    try {
      const stats = await fileSystemService.stat(imagePath);
      const lastModified = stats.mtime.toUTCString();
      const etag = `"${stats.size}-${stats.mtimeMs}"`;
      return { lastModified, etag };
    } catch {
      logService.error(`Error getting image stats for: ${imagePath}`);
      return null;
    }
  };

  const getMimeType = (ext: string): string => {
    switch (ext.toLowerCase()) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      case "webp":
        return "image/webp";
      case "svg":
        return "image/svg+xml";
      case "ico":
        return "image/x-icon";
      default:
        return "application/octet-stream";
    }
  };

  const isValidUploadSource = (
    uploader: string | null
  ): uploader is Image["Source"] => {
    if (!uploader) return false;
    return validImageSources.includes(uploader as Image["Source"]);
  };

  const getGameImage = async (
    playniteGameId: string,
    imageFileName: string,
    ifNoneMatch: string | null,
    ifModifiedSince: string | null
  ): Promise<Response> => {
    const imagePath = join(FILES_DIR, playniteGameId, imageFileName);
    if (!(await checkIfImageExists(imagePath))) {
      return new Response(null, { status: 404 });
    }
    const imageStats = await getImageStats(imagePath);
    if (!imageStats) {
      return new Response(null, { status: 500 });
    }
    const { lastModified, etag } = imageStats;
    // Image cached and not modified
    if (ifNoneMatch === etag || ifModifiedSince === lastModified) {
      return new Response(null, { status: 304 });
    }
    const imageExtension = extname(imageFileName).replace(".", "");
    try {
      const imageFile = await fileSystemService.readfile(imagePath);
      const response = new Response(new Uint8Array(imageFile), {
        headers: {
          "Content-Type": getMimeType(imageExtension),
          "Cache-Control": "public, max-age=604800, immutable",
          "Last-Modified": lastModified,
          ETag: etag,
        },
      });
      return response;
    } catch (error) {
      logService.error(
        `Error reading image file: ${imagePath}`,
        error as Error
      );
      return new Response(null, { status: 500 });
    }
  };

  const getScreenshotAsync: MediaFilesService["getScreenshotAsync"] = async (
    imageFileName,
    ifNoneMatch,
    ifModifiedSince
  ) => {
    const imagePath = join(SCREENSHOTS_DIR, imageFileName);
    if (!(await checkIfImageExists(imagePath))) {
      return new Response(null, { status: 404 });
    }
    const imageStats = await getImageStats(imagePath);
    if (!imageStats) {
      return new Response(null, { status: 500 });
    }
    const { lastModified, etag } = imageStats;
    if (ifNoneMatch === etag || ifModifiedSince === lastModified) {
      return new Response(null, { status: 304 });
    }
    const imageExtension = extname(imageFileName).replace(".", "");
    const imageFile = await fileSystemService.readfile(imagePath);
    const response = new Response(new Uint8Array(imageFile), {
      headers: {
        "Content-Type": getMimeType(imageExtension),
        "Cache-Control": "public, max-age=604800, immutable",
        "Last-Modified": lastModified,
        ETag: etag,
      },
    });
    return response;
  };

  const uploadScreenshotsAsync: MediaFilesService["uploadScreenshotsAsync"] =
    async (request) => {
      const uploader = request.headers.get("X-Upload-Source");
      const source: Image["Source"] = isValidUploadSource(uploader)
        ? uploader
        : "unknown";
      logService.info(`Received request to upload images from ${source}`);
      return await uploadService.uploadImagesAsync(
        request,
        SCREENSHOTS_DIR,
        source
      );
    };

  const getAvailableScreenshots: MediaFilesService["getAvailableScreenshots"] =
    async () => {
      const entries = await fileSystemService.readdir(SCREENSHOTS_DIR, {
        recursive: true,
        withFileTypes: true,
      });
      const filesWithTime = await Promise.all(
        entries
          .filter((e) => e.isFile())
          .map(async (e) => {
            const fullPath = join(SCREENSHOTS_DIR, e.name);
            const stats = await fileSystemService.stat(fullPath);
            return { name: e.name, mtime: stats.mtime };
          })
      );
      filesWithTime.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
      return filesWithTime.map((f) => f.name);
    };

  return {
    getGameImage,
    getScreenshotAsync,
    uploadScreenshotsAsync,
    getAvailableScreenshots,
  };
};
