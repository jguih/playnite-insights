import type { InstanceSession } from "@playnite-insights/lib/client";

export type InstanceSessionsRepository = {
  add: (session: InstanceSession) => void;
  getById: (id: InstanceSession["Id"]) => InstanceSession | null;
};
