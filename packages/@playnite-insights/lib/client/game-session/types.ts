import z from "zod";
import {
  closeGameSessionSchema,
  gameSessionSchema,
  gameSessionsDtoSchema,
  openGameSessionSchema,
  sessionStatus,
} from "./schemas";

export type GameSession = z.infer<typeof gameSessionSchema>;
export type GameSessionStatus =
  (typeof sessionStatus)[keyof typeof sessionStatus];
export type GameSessionsDto = z.infer<typeof gameSessionsDtoSchema>;
export type OpenSessionCommand = z.infer<typeof openGameSessionSchema>;
export type CloseSessionCommand = z.infer<typeof closeGameSessionSchema>;
export type GameActivity = {
  status: "in_progress" | "not_playing";
  gameName: string;
  gameId: string;
  totalPlaytime: number;
  sessions: GameSession[];
};

export type DateFilter =
  | { op: "between"; start: string; end: string }
  | { op: "gte"; value: string }
  | { op: "lte"; value: string }
  | { op: "eq"; value: string }
  | { op: "overlaps"; start: string; end: string };

export type GameSessionFilters = {
  startTime?: DateFilter[];
};
