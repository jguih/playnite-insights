import type { LogService } from "@playatlas/shared/core";
import {
  type CloseSessionCommand,
  type GameSession,
  type OpenSessionCommand,
} from "../game-session";
import type { GameRepository } from "../repository/game";
import type { GameSessionRepository } from "../repository/game-session";

export type GameSessionService = {
  open: (command: OpenSessionCommand) => boolean;
  close: (command: CloseSessionCommand) => boolean;
  getRecent: () => GameSession[] | null;
};

export type GameSessionServiceDeps = {
  logService: LogService;
  gameSessionRepository: GameSessionRepository;
  playniteGameRepository: GameRepository;
};
