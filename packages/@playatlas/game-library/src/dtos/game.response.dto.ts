import z from "zod";

export const gameResponseDtoSchema = z.object({
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
  Hidden: z.number(),
  CompletionStatusId: z.string().nullable(),
  ContentHash: z.string(),
  Developers: z.array(z.string()),
  Publishers: z.array(z.string()),
  Genres: z.array(z.string()),
  Platforms: z.array(z.string()),
});

export type GameResponseDto = z.infer<typeof gameResponseDtoSchema>;
