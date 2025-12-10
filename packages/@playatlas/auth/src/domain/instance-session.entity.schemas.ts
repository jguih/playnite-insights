import z from "zod";

const instanceSessionExtraPropsSchema = z.object({
  createdAt: z.date(),
  lastUsedAt: z.date(),
});

export const makeInstanceSessionPropsSchema = z.object({
  sessionId: z.string(),
});

export const buildInstanceSessionPropsSchema =
  makeInstanceSessionPropsSchema.extend(
    instanceSessionExtraPropsSchema.partial().shape
  );

export const rehydrateInstanceSessionPropsSchema =
  makeInstanceSessionPropsSchema.extend(instanceSessionExtraPropsSchema.shape);
