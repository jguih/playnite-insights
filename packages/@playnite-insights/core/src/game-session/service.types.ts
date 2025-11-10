import type { GameRepository } from "@playatlas/game-library/core";
import {
  type CloseSessionCommand,
  type GameSession,
  type OpenSessionCommand,
} from "@playnite-insights/lib/client";
import type { GameSessionRepository } from "../types/game-session-repository";
import type { LogService } from "../types/log-service";

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
