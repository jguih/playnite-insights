import { BaseEntity } from "@playatlas/common/domain";
import { MakeCompletionStatusProps } from "./completion-status.entity.types";

export type CompletionStatusId = string;
type CompletionStatusName = string;

export type CompletionStatus = BaseEntity<CompletionStatusId> &
  Readonly<{
    getName: () => CompletionStatusName;
  }>;

export const makeCompletionStatus = (
  props: MakeCompletionStatusProps
): CompletionStatus => {
  const _id: CompletionStatusId = props.id;
  const _name: CompletionStatusName = props.name;

  const completionStatus: CompletionStatus = {
    getId: () => _id,
    getSafeId: () => _id,
    getName: () => _name,
    validate: () => {},
  };
  return Object.freeze(completionStatus);
};
