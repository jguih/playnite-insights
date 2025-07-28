import type { GameSession, GameSessionFilters } from "@playnite-insights/lib";

export type GameSessionRepository = {
  getById: (sessionId: GameSession["SessionId"]) => GameSession | undefined;
  add: (newSession: GameSession) => boolean;
  update: (session: GameSession) => boolean;
  all: () => GameSession[] | undefined;
  unlinkSessionsForGame: (gameId: string) => boolean;
  findAllBy: (params: {
    filters?: GameSessionFilters;
  }) => GameSession[] | undefined;
};
