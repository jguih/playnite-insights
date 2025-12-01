import z from "zod";
import { ISODateSchema } from "../../schemas";

export const getServerUtcNowResponseSchema = z.object({
  utcNow: ISODateSchema,
});

export type GetServerUtcNowResponse = z.infer<
  typeof getServerUtcNowResponseSchema
>;
