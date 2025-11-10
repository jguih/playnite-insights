import { ISODateSchema } from "@playatlas/shared/core";
import z from "zod";

export const getServerUtcNowResponseSchema = z.object({
  utcNow: ISODateSchema,
});

export type GetServerUtcNowResponse = z.infer<
  typeof getServerUtcNowResponseSchema
>;
