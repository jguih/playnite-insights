import type { LogService } from "@playatlas/shared/core";
import {
  type CloseSessionCommand,
  type GameSession,
  type OpenSessionCommand,
} from "../game-session";
import type { GameSessionRepository } from "../repository/game-session";

export type OpenGameSessionArgs = OpenSessionCommand & {
  GameName?: string | null;
};
export type CloseGameSessionArgs = CloseSessionCommand & {
  GameName?: string | null;
};

export type GameSessionService = {
  open: (args: OpenGameSessionArgs) => boolean;
  close: (args: CloseGameSessionArgs) => boolean;
  getRecent: () => GameSession[] | null;
};

export type GameSessionServiceDeps = {
  logService: LogService;
  gameSessionRepository: GameSessionRepository;
};
