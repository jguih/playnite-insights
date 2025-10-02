import type z from "zod";
import {
  instanceAuthenticationSchema,
  instanceSessionSchema,
  validAuthenticationHeaders,
} from "./schemas";

export type ValidAuthenticationHeader = keyof typeof validAuthenticationHeaders;

export type InstanceAuthentication = z.infer<
  typeof instanceAuthenticationSchema
>;

export type InstanceSession = z.infer<typeof instanceSessionSchema>;
