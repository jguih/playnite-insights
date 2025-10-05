import {
  type GameNote,
  type GameNoteFilters,
} from "@playnite-insights/lib/client";

export type GameNoteRepository = {
  add: (note: GameNote) => GameNote;
  update: (note: GameNote) => GameNote;
  remove: (noteId: GameNote["Id"]) => void;
  all: (args?: { filters?: GameNoteFilters }) => GameNote[];
  getById: (id: string) => GameNote | null;
  /**
   * Updates database using the provided array as source of truth.
   * `LastUpdatedAt` will be used to resolve conflicts, where the most recent note will prevail. Any missing notes from database will be added.
   * @param notes
   */
  reconsileFromSource: (notes: GameNote[]) => void;
};
