import {
  CloseSessionCommand,
  GameSession,
  OpenSessionCommand,
} from "@playnite-insights/lib";

export type GameSessionService = {
  exists: (sessionId: GameSession["SessionId"]) => boolean;
  open: (command: OpenSessionCommand) => boolean;
  close: (command: CloseSessionCommand) => boolean;
  all: () => GameSession[] | undefined;
};
