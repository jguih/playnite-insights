import type { GameNote } from "../../core/types/game-note";

export class GameNoteFactory {
  constructor() {}

  create = (
    props: Pick<
      GameNote,
      "Title" | "Content" | "ImagePath" | "GameId" | "SessionId"
    >
  ): GameNote => {
    return {
      Id: crypto.randomUUID(),
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
