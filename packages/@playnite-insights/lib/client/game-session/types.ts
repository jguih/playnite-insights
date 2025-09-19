import z from "zod";
import type { DateFilter } from "../types/date-filter";
import {
  closeGameSessionSchema,
  gameSessionSchema,
  openGameSessionSchema,
  sessionStatus,
} from "./schemas";

export type GameSession = z.infer<typeof gameSessionSchema>;
export type GameSessionStatus =
  (typeof sessionStatus)[keyof typeof sessionStatus];
export type OpenSessionCommand = z.infer<typeof openGameSessionSchema>;
export type CloseSessionCommand = z.infer<typeof closeGameSessionSchema>;
export type GameActivity = {
  status: "in_progress" | "not_playing";
  gameName: string | null;
  gameId: string | null;
  totalPlaytime: number;
  sessions: GameSession[];
};

export type GameSessionFilters = {
  startTime?: DateFilter[];
  status?: {
    op: "in" | "not in";
    types: GameSession["Status"][];
  };
};
