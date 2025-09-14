import { ImageService, ImageServiceDeps } from "./service.types";

export const makeImageService = ({
  logService,
  uploadService,
  SCREENSHOTS_DIR,
}: ImageServiceDeps): ImageService => {
  const uploadScreenshotsAsync: ImageService["uploadScreenshotsAsync"] = async (
    request
  ) => {
    logService.debug(`Downloading screenshot to disk`);
    return uploadService.uploadImagesAsync(request, SCREENSHOTS_DIR);
  };

  return { uploadScreenshotsAsync };
};
