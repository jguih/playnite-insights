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

export const makeCompletionStatusFactory = () => {
  const buildCompletionStatus = (
    props: Partial<MakeCompletionStatusProps> = {}
  ) => {
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

  const buildDefaultCompletionStatusList = (): CompletionStatus[] => {
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
