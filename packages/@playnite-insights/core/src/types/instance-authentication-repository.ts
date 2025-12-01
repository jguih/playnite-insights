import { type InstanceAuthentication } from "@playnite-insights/lib/client";

export type InstanceAuthenticationRepository = {
  get: () => InstanceAuthentication | null;
  set: (auth: InstanceAuthentication) => void;
};
