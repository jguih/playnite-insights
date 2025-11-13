import z from "zod";

export const applicationSettingsSchema = z.object({
  desconsiderHiddenGames: z.boolean(),
});

export const keyValueSchema = z.discriminatedUnion("Key", [
  z.object({
    Key: z.literal("instance-registered"),
    Value: z.boolean(),
  }),
  z.object({
    Key: z.literal("session-id"),
    Value: z.string(),
  }),
  z.object({
    Key: z.literal("application-settings"),
    Value: applicationSettingsSchema,
  }),
  z.object({
    Key: z.literal("sync-id"),
    Value: z.string(),
  }),
]);
