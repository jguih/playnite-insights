import z from "zod";
import { DateFilter } from "../types/date-filter";
import { gameNoteSchema } from "./schemas";

export type GameNote = z.infer<typeof gameNoteSchema>;

export type GameNoteFilters = {
  lastUpdatedAt?: DateFilter[];
};
