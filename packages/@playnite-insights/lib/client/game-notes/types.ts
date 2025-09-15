import z from "zod";
import type { DateFilter } from "../types/date-filter";
import { gameNoteSchema } from "./schemas";

export type GameNote = z.infer<typeof gameNoteSchema>;

export type GameNoteFilters = {
  lastUpdatedAt?: DateFilter[];
};
