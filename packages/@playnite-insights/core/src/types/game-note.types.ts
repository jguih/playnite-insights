import { GameNoteFilters, type GameNote } from "@playnite-insights/lib/client";

export type GameNoteRepository = {
  add: (note: GameNote) => GameNote;
  update: (note: GameNote) => GameNote;
  remove: (noteId: GameNote["Id"]) => void;
  all: (args?: { filters?: GameNoteFilters }) => GameNote[];
  getById: (id: string) => GameNote | null;
};
