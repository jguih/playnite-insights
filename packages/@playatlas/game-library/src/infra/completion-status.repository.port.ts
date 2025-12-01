import { CompletionStatus } from "../domain/completion-status.entity";

export type CompletionStatusRepository = {
  add: (completionStatus: CompletionStatus) => void;
  update: (completionStatus: CompletionStatus) => void;
  getById: (id: string) => CompletionStatus | null;
  all: () => CompletionStatus[];
  upsertMany: (completionStatusRepository: CompletionStatus[]) => void;
};
