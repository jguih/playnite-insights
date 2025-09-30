import z from "zod";
import type { keyValueSchema } from "./schemas";

export type KeyValue = z.infer<typeof keyValueSchema>;

export type KeyValueMap = {
  [K in KeyValue as K["Key"]]: K["Value"];
};
