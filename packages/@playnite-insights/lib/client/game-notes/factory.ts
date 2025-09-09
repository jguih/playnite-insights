import { GameNote } from "./types";

export class GameNoteFactory {
  constructor() {}

  create = (
    props: Pick<
      GameNote,
      "Title" | "Content" | "ImagePath" | "GameId" | "SessionId"
    >
  ): GameNote => {
    return {
      Id: `tmp-${crypto.randomUUID()}`,
      CreatedAt: new Date().toISOString(),
      LastUpdatedAt: new Date().toISOString(),
      ...props,
    };
  };
}
