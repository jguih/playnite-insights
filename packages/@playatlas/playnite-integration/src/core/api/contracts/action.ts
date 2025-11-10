import z from "zod";

export const remoteActionSchema = z.object({
  action: z.enum(["screenshot"]),
});

export type RemoteAction = z.infer<typeof remoteActionSchema>;
