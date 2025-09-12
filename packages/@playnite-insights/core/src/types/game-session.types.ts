import type {
  GameSession,
  GameSessionFilters,
} from "@playnite-insights/lib/client";

export type GameSessionRepository = {
  getById: (sessionId: GameSession["SessionId"]) => GameSession | null;
  add: (newSession: GameSession) => boolean;
  update: (session: GameSession) => boolean;
  all: () => GameSession[];
  unlinkSessionsForGame: (gameId: string) => boolean;
  findAllBy: (params: { filters?: GameSessionFilters }) => GameSession[];
};
