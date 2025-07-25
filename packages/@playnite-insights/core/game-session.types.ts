import type { GameSession } from "@playnite-insights/lib";

export type GameSessionRepository = {
  getById: (sessionId: GameSession["SessionId"]) => GameSession | undefined;
  add: (newSession: GameSession) => boolean;
  update: (session: GameSession) => boolean;
  all: () => GameSession[] | undefined;
};
