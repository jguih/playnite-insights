import { Image } from "@playnite-insights/lib/client";

export type UploadService = {
  uploadImagesAsync: (
    request: Request,
    path: string,
    source: Image["Source"]
  ) => Promise<string[]>;
};
