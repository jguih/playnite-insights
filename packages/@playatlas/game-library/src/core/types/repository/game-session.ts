import type { GameSession, GameSessionFilters } from "../game-session";

export type GameSessionRepository = {
  getById: (sessionId: GameSession["SessionId"]) => GameSession | null;
  add: (newSession: GameSession) => boolean;
  update: (session: GameSession) => boolean;
  all: () => GameSession[];
  findAllBy: (params: { filters?: GameSessionFilters }) => GameSession[];
};
