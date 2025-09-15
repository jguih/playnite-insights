import z from "zod";

export const uploadScreenshotResponseSchema = z.object({
  uploaded: z.array(z.string()),
});
export type UploadScreenshotResponse = z.infer<
  typeof uploadScreenshotResponseSchema
>;

export const getAllScreenshotsResponseSchema = z.object({
  screenshots: z.array(z.string()),
});
export type GetAllScreenshotsResponse = z.infer<
  typeof getAllScreenshotsResponseSchema
>;
