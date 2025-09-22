import { CompletionStatus } from "@playnite-insights/lib/client";

export type CompletionStatusRepository = {
  add: (completionStatus: CompletionStatus) => boolean;
  update: (completionStatus: CompletionStatus) => boolean;
  getById: (id: string) => CompletionStatus | undefined;
  hasChanges: (
    oldCompletionStatus: CompletionStatus,
    newCompletionStatus: CompletionStatus
  ) => boolean;
  all: () => CompletionStatus[] | undefined;
};
