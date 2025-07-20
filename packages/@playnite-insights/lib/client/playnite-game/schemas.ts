import z from "zod";

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

export const fullGameRawSchema = z.object({
  ...playniteGameSchema.shape,
  Developers: z.string().nullable(),
  Publishers: z.string().nullable(),
  Genres: z.string().nullable(),
  Platforms: z.string().nullable(),
});

export const fullGameSchema = z.object({
  ...playniteGameSchema.shape,
  Developers: z.array(z.string()),
  Publishers: z.array(z.string()),
  Genres: z.array(z.string()),
  Platforms: z.array(z.string()),
});

export const gameManifestDataSchema = z.array(
  z.object({
    Id: z.string(),
    ContentHash: z.string(),
  })
);

export const gameSortBy = [
  "LastActivity",
  "IsInstalled",
  "Added",
  "Playtime",
] as const;
export const gameSortOrder = ["desc", "asc"] as const;
export const gamePageSizes = ["25", "50", "75", "100"] as const;
