import { LogService, UploadService } from "../types";

export type ImageServiceDeps = {
  uploadService: UploadService;
  logService: LogService;
  SCREENSHOTS_DIR: string;
};

export type ImageService = {
  uploadScreenshotsAsync: (request: Request) => Promise<string[]>;
};
