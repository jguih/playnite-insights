import z from "zod";

const instanceAuthSettingsExtraPropsSchema = z.object({
  createdAt: z.date(),
  lastUpdatedAt: z.date(),
});

export const makeInstanceAuthSettingsPropsSchema = z.object({
  passwordHash: z.string(),
  salt: z.string(),
});

export const buildInstanceAuthSettingsPropsSchema =
  makeInstanceAuthSettingsPropsSchema.extend(
    instanceAuthSettingsExtraPropsSchema.partial().shape
  );

export const rehydrateInstanceAuthSettingsPropsSchema =
  makeInstanceAuthSettingsPropsSchema.extend(
    instanceAuthSettingsExtraPropsSchema.shape
  );
