import z from "zod";

export const platformResponseDtoSchema = z.object({
  Id: z.string(),
  Name: z.string(),
  SpecificationId: z.string(),
  Icon: z.string().nullable(),
  Cover: z.string().nullable(),
  Background: z.string().nullable(),
});

export type PlatformResponseDto = z.infer<typeof platformResponseDtoSchema>;
