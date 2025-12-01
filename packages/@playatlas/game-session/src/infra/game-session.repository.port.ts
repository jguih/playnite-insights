import type { GameSession, GameSessionId } from "../domain/game-session.entity";
import type { GameSessionFilters } from "./game-session.repository";

export type GameSessionRepository = {
  add: (newSession: GameSession) => boolean;
  update: (session: GameSession) => boolean;
  all: () => GameSession[];
  getById: (sessionId: GameSessionId) => GameSession | null;
  getAllBy: (params: { filters?: GameSessionFilters }) => GameSession[];
};
