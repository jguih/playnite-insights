import z from "zod";

export const uploadScreenshotResponseSchema = z.object({
  uploaded: z.array(z.string()),
});
export type UploadScreenshotResponse = z.infer<
  typeof uploadScreenshotResponseSchema
>;
