import z from "zod";

export const apiSSEventDataSchema = {
  message: z.string(),
  screenshotTaken: z.object({ paths: z.array(z.string()) }),
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
    };
