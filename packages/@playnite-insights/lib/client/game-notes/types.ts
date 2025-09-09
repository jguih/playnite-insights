import z from "zod";
import { gameNoteSchema } from "./schemas";

export type GameNote = z.infer<typeof gameNoteSchema>;
