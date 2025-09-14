import { UploadService } from "../types";

export type ImageServiceDeps = {
  uploadService: UploadService;
  SCREENSHOTS_DIR: string;
};

export type ImageService = {
  uploadScreenshotsAsync: (request: Request) => Promise<string[]>;
};
