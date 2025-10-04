import type { SynchronizationId } from "@playnite-insights/lib/client";

export type SynchronizationIdRepository = {
  get: () => SynchronizationId | null;
  set: (syncId: SynchronizationId) => void;
};
