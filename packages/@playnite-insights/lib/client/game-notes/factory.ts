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
      DeletedAt: null,
      Title: props.Title,
      Content: props.Content,
      GameId: props.GameId,
      ImagePath: props.ImagePath,
      SessionId: props.SessionId,
    };
  };
}
