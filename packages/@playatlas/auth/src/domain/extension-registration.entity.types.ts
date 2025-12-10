import z from "zod";
import {
  buildExtensionRegistrationPropsSchema,
  makeExtensionRegistrationPropsSchema,
  rehydrateExtensionRegistrationPropsSchema,
} from "./extension-registration.entity.schemas";

export type BuildExtensionRegistrationProps = z.infer<
  typeof buildExtensionRegistrationPropsSchema
>;

export type MakeExtensionRegistrationProps = z.infer<
  typeof makeExtensionRegistrationPropsSchema
>;

export type RehydrateExtensionRegistrationProps = z.infer<
  typeof rehydrateExtensionRegistrationPropsSchema
>;
