import z from "zod";
import { platformSchema } from "../../validation/schemas/platform";

export const getAllPlatformsResponseSchema = z.array(platformSchema);
export type GetAllPlatformsResponse = z.infer<
  typeof getAllPlatformsResponseSchema
>;
