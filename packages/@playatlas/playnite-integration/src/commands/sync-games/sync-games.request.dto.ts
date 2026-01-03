import { ISODateSchema } from "@playatlas/common/common";
import z from "zod";

const platformSchema = z.object({
  SpecificationId: z.string(),
  Icon: z.string().optional().nullable(),
  Cover: z.string().optional().nullable(),
  Background: z.string().optional().nullable(),
  Id: z.string(),
  Name: z.string(),
});

const genreSchema = z.object({
  Id: z.string(),
  Name: z.string(),
});

const companySchema = z.object({
  Id: z.string(),
  Name: z.string(),
});

const developerSchema = companySchema;

const publisherSchema = companySchema;

const completionStatusSchema = z.object({
  Id: z.string(),
  Name: z.string(),
});

export const syncGamesItemDtoSchema = z.object({
  Id: z.string(),
  Name: z.string().optional().nullable(),
  Description: z.string().optional().nullable(),
  Platforms: z.array(platformSchema).optional().nullable(),
  Genres: z.array(genreSchema).optional().nullable(),
  Developers: z.array(developerSchema).optional().nullable(),
  Publishers: z.array(publisherSchema).optional().nullable(),
  ReleaseDate: ISODateSchema.optional().nullable(),
  Playtime: z.number(),
  LastActivity: ISODateSchema.optional().nullable(),
  Added: ISODateSchema.optional().nullable(),
  InstallDirectory: z.string().optional().nullable(),
  IsInstalled: z.boolean(),
  BackgroundImage: z.string().optional().nullable(),
  CoverImage: z.string().optional().nullable(),
  Icon: z.string().optional().nullable(),
  Hidden: z.boolean(),
  CompletionStatus: completionStatusSchema.optional().nullable(),
  ContentHash: z.string(),
});

export const syncGamesRequestDtoSchema = z.object({
  AddedItems: z.array(syncGamesItemDtoSchema),
  RemovedItems: z.array(z.string()),
  UpdatedItems: z.array(syncGamesItemDtoSchema),
});

export type SyncGamesItemDto = z.infer<typeof syncGamesItemDtoSchema>;
export type SyncGamesRequestDto = z.infer<typeof syncGamesRequestDtoSchema>;
