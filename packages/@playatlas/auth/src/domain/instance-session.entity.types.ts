import z from "zod";
import {
  buildInstanceSessionPropsSchema,
  makeInstanceSessionPropsSchema,
  rehydrateInstanceSessionPropsSchema,
} from "./instance-session.entity.schemas";

export type BuildInstanceSessionProps = z.infer<
  typeof buildInstanceSessionPropsSchema
>;

export type MakeInstanceSessionProps = z.infer<
  typeof makeInstanceSessionPropsSchema
>;

export type RehydrateInstanceSessionProps = z.infer<
  typeof rehydrateInstanceSessionPropsSchema
>;
