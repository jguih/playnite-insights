import z from "zod";

export const apiSSEventDataSchema = {
  message: z.string(),
  screenshotTaken: z.object({ paths: z.array(z.string()) }),
  gameLibraryUpdated: z.boolean(),
  recentGameSessionsUpdated: z.boolean(),
  sessionOpened: z.boolean(),
  sessionClosed: z.boolean(),
  heartbeat: z.boolean(),
} as const;

export const apiSSEventType = Object.fromEntries(
  Object.keys(apiSSEventDataSchema).map((k) => [k, k])
) as { [K in keyof typeof apiSSEventDataSchema]: K };

export type APISSEventType = keyof typeof apiSSEventType;

export type APISSEvent =
  | {
      type: typeof apiSSEventType.message;
      data: z.infer<typeof apiSSEventDataSchema.message>;
    }
  | {
      type: typeof apiSSEventType.screenshotTaken;
      data: z.infer<typeof apiSSEventDataSchema.screenshotTaken>;
    }
  | {
      type: typeof apiSSEventType.gameLibraryUpdated;
      data: z.infer<typeof apiSSEventDataSchema.gameLibraryUpdated>;
    }
  | {
      type: typeof apiSSEventType.recentGameSessionsUpdated;
      data: z.infer<typeof apiSSEventDataSchema.recentGameSessionsUpdated>;
    }
  | {
      type: typeof apiSSEventType.sessionOpened;
      data: z.infer<typeof apiSSEventDataSchema.sessionOpened>;
    }
  | {
      type: typeof apiSSEventType.sessionClosed;
      data: z.infer<typeof apiSSEventDataSchema.sessionClosed>;
    }
  | {
      type: typeof apiSSEventType.heartbeat;
      data: z.infer<typeof apiSSEventDataSchema.heartbeat>;
    };
