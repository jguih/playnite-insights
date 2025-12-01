import { type SyncQueueItem } from "./types";

export class SyncQueueFactory {
  constructor() {}

  create = (
    props: Pick<SyncQueueItem, "Entity" | "Payload"> &
      Partial<Pick<SyncQueueItem, "Type">>
  ): SyncQueueItem => {
    return {
      CreatedAt: new Date().toISOString(),
      Status: "pending",
      Type: props.Type ?? "create",
      Retries: 0,
      ...props,
    };
  };
}
