export type UploadService = {
  uploadImagesAsync: (request: Request, path: string) => Promise<string[]>;
};
