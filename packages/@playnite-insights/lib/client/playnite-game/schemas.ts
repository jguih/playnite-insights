import z from "zod";
import { developerSchema } from "../developer/schemas";

export const playniteGameSchema = z.object({
  Id: z.string(),
  Name: z.string().nullable(),
  Description: z.string().nullable(),
  ReleaseDate: z.string().nullable(),
  Playtime: z.number(),
  LastActivity: z.string().nullable(),
  Added: z.string().nullable(),
  InstallDirectory: z.string().nullable(),
  IsInstalled: z.number(),
  BackgroundImage: z.string().nullable(),
  CoverImage: z.string().nullable(),
  Icon: z.string().nullable(),
  ContentHash: z.string(),
});

export const gameByIdSchema = z.object({
  game: z.optional(playniteGameSchema),
  developers: z.array(developerSchema).optional(),
});

export const gameManifestDataSchema = z.array(
  z.object({
    Id: z.string(),
    ContentHash: z.string(),
  })
);

export const gameSortBy = ["Id", "IsInstalled"] as const;
export const gameSortOrder = ["asc", "desc"] as const;
export const gamePageSizes = ["25", "50", "75", "100"] as const;
