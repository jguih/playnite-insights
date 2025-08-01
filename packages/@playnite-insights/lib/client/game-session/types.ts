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

export type GameSessionFilters = {
  date?: {
    start: string;
    end: string;
  };
};
