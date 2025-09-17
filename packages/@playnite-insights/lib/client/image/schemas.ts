import z from "zod";
import { ISODateSchema } from "../schemas";

export const validImageSources = [
  "playatlas-exporter",
  "unknown",
  "web-ui",
] as const;

export const imageSchema = z.object({
  Id: z.number(),
  FileExtension: z.string(),
  FilePath: z.string(),
  FileName: z.string(),
  FileSize: z.number(), // Bytes
  CreatedAt: ISODateSchema,
  DeletedAt: ISODateSchema.nullable(),
  CheckSum: z.string(),
  MimeType: z.string().nullable(),
  Source: z.enum(validImageSources),
  Width: z.number().nullable(),
  Height: z.number().nullable(),
});
