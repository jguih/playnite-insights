import z from "zod";

export const keyValueSchema = z.discriminatedUnion("Key", [
  z.object({
    Key: z.literal("instance-registered"),
    Value: z.boolean(),
  }),
]);
