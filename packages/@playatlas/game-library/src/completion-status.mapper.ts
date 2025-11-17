import {
  CompletionStatus,
  makeCompletionStatus,
} from "./domain/completion-status.entity";
import { CompletionStatusModel } from "./infra/completion-status.repository";

export const completionStatusMapper = {
  toPersistence: (
    completionStatus: CompletionStatus
  ): CompletionStatusModel => {
    const record: CompletionStatusModel = {
      Id: completionStatus.getId(),
      Name: completionStatus.getName(),
    };
    return record;
  },
  toDomain: (completionStatus: CompletionStatusModel): CompletionStatus => {
    const entity: CompletionStatus = makeCompletionStatus({
      id: completionStatus.Id,
      name: completionStatus.Name,
    });
    return entity;
  },
};
