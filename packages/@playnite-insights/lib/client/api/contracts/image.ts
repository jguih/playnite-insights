import z from "zod";
import { imageSchema } from "../../image";

export const uploadScreenshotResponseSchema = z.object({
  uploaded: z.array(z.string()),
});
export type UploadScreenshotResponse = z.infer<
  typeof uploadScreenshotResponseSchema
>;

export const getAllScreenshotsResponseSchema = z.object({
  screenshots: z.array(
    z.object({
      ...imageSchema.shape,
      Path: z.string(),
    })
  ),
});
export type GetAllScreenshotsResponse = z.infer<
  typeof getAllScreenshotsResponseSchema
>;
