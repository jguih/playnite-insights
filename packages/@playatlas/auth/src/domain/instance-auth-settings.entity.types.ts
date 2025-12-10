import z from "zod";
import {
  buildInstanceAuthSettingsPropsSchema,
  makeInstanceAuthSettingsPropsSchema,
  rehydrateInstanceAuthSettingsPropsSchema,
} from "./instance-auth-settings.entity.schemas";

export type BuildInstanceAuthSettingsProps = z.infer<
  typeof buildInstanceAuthSettingsPropsSchema
>;
export type MakeInstanceAuthSettingsProps = z.infer<
  typeof makeInstanceAuthSettingsPropsSchema
>;
export type RehydrateInstanceAuthSettingsProps = z.infer<
  typeof rehydrateInstanceAuthSettingsPropsSchema
>;
