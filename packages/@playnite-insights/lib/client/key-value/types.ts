import z from "zod";
import type { applicationSettingsSchema, keyValueSchema } from "./schemas";

export type KeyValue = z.infer<typeof keyValueSchema>;

export type KeyValueMap = {
  [K in KeyValue as K["Key"]]: K["Value"];
};

export type ApplicationSettings = z.infer<typeof applicationSettingsSchema>;
