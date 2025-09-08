import z from "zod";
import { platformSchema } from "../../platform";

export const getAllPlatformsResponseSchema = z.array(platformSchema);
export type GetAllPlatformsResponse = z.infer<
  typeof getAllPlatformsResponseSchema
>;
