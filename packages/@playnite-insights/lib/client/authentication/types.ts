import type z from "zod";
import {
  instanceAuthenticationSchema,
  validAuthenticationHeaders,
} from "./schemas";

export type ValidAuthenticationHeader = keyof typeof validAuthenticationHeaders;

export type InstanceAuthentication = z.infer<
  typeof instanceAuthenticationSchema
>;
