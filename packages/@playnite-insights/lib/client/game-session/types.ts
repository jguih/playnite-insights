import z from "zod";
import {
  closeGameSessionSchema,
  gameSessionSchema,
  openGameSessionSchema,
} from "./schemas";

export type GameSession = z.infer<typeof gameSessionSchema>;
export type OpenSessionCommand = z.infer<typeof openGameSessionSchema>;
export type CloseSessionCommand = z.infer<typeof closeGameSessionSchema>;

export type GameSessionFilters = {
  date?: string;
};
