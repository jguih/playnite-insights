import type { DateFilter } from "@playatlas/shared/core";
import z from "zod";
import type { gameNoteSchema } from "../validation/schemas/game-note";

export type GameNote = z.infer<typeof gameNoteSchema>;

export type GameNoteFilters = {
  lastUpdatedAt?: DateFilter[];
};
