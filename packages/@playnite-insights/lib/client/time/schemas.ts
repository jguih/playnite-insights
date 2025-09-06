import z from "zod";
import { ISODateSchema } from "../schemas";

export const getServerTimeResponseSchema = z.object({
  utcNow: ISODateSchema,
});
