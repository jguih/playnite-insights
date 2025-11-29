import { faker } from "@faker-js/faker";
import {
  CompletionStatus,
  makeCompletionStatus,
} from "../domain/completion-status.entity";
import { MakeCompletionStatusProps } from "../domain/completion-status.entity.types";

const completionStatusName = {
  playing: "playing",
  played: "played",
  completed: "completed",
  abandoned: "abandoned",
  toPlay: "to play",
} as const;

export type CompletionStatusFactory = {
  buildCompletionStatus: (
    props?: Partial<MakeCompletionStatusProps>
  ) => CompletionStatus;
  buildDefaultCompletionStatusList: () => CompletionStatus[];
};

export const makeCompletionStatusFactory = (): CompletionStatusFactory => {
  const buildCompletionStatus: CompletionStatusFactory["buildCompletionStatus"] =
    (props = {}) => {
      return makeCompletionStatus({
        id: props.id ?? faker.string.uuid(),
        name:
          props.name ??
          faker.helpers.arrayElement([
            completionStatusName.playing,
            completionStatusName.played,
            completionStatusName.completed,
            completionStatusName.abandoned,
            completionStatusName.toPlay,
          ]),
      });
    };

  const buildDefaultCompletionStatusList: CompletionStatusFactory["buildDefaultCompletionStatusList"] =
    () => {
      const list: CompletionStatus[] = [];
      for (const value of Object.values(completionStatusName))
        list.push(buildCompletionStatus({ name: value }));
      return list;
    };

  return {
    buildCompletionStatus,
    buildDefaultCompletionStatusList,
  };
};
