import { SyncQueueItem } from "./types";

export class SyncQueueFactory {
  constructor() {}

  create = (
    props: Pick<SyncQueueItem, "Entity" | "Payload"> &
      Partial<Pick<SyncQueueItem, "Type">>
  ): SyncQueueItem => {
    return {
      Id: crypto.randomUUID(),
      CreatedAt: new Date().toISOString(),
      Status: "pending",
      Type: props.Type ?? "create",
      ...props,
    };
  };
}
