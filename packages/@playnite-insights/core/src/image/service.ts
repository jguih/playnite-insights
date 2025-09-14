import { ImageService, ImageServiceDeps } from "./service.types";

export const makeImageService = ({
  uploadService,
  SCREENSHOTS_DIR,
}: ImageServiceDeps): ImageService => {
  const uploadScreenshotsAsync: ImageService["uploadScreenshotsAsync"] = async (
    request
  ) => {
    return uploadService.uploadImagesAsync(request, SCREENSHOTS_DIR);
  };

  return { uploadScreenshotsAsync };
};
