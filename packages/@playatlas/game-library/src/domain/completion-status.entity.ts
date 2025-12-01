import { MakeCompletionStatusProps } from "./completion-status.entity.types";

export type CompletionStatusId = string;
type CompletionStatusName = string;

export type CompletionStatus = Readonly<{
  getId: () => CompletionStatusId;
  getName: () => CompletionStatusName;
}>;

export const makeCompletionStatus = (
  props: MakeCompletionStatusProps
): CompletionStatus => {
  const _id: CompletionStatusId = props.id;
  const _name: CompletionStatusName = props.name;

  return Object.freeze({
    getId: () => _id,
    getName: () => _name,
  });
};
