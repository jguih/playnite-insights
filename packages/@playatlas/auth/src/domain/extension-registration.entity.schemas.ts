import z from "zod";
import { extensionRegistrationStatus } from "./extension-registration.constants";

const extensionRegistrationExtraProps = z.object({
  id: z.number(),
  status: z.nativeEnum(extensionRegistrationStatus),
  createdAt: z.date(),
  lastUpdatedAt: z.date(),
});

export const makeExtensionRegistrationPropsSchema = z.object({
  extensionId: z.string(),
  publicKey: z.string(),
  hostname: z.string().nullable(),
  os: z.string().nullable(),
  extensionVersion: z.string().nullable(),
});

export const buildExtensionRegistrationPropsSchema =
  makeExtensionRegistrationPropsSchema.extend(
    extensionRegistrationExtraProps.partial().shape
  );

export const rehydrateExtensionRegistrationPropsSchema =
  makeExtensionRegistrationPropsSchema.extend(
    extensionRegistrationExtraProps.shape
  );
