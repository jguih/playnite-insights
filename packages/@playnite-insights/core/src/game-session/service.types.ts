import {
  type CloseSessionCommand,
  type GameSession,
  type OpenSessionCommand,
} from "@playnite-insights/lib/client";
import type { PlayniteGameRepository } from "../types";
import type { GameSessionRepository } from "../types/game-session.types";
import type { LogService } from "../types/log.types";

export type GameSessionService = {
  open: (command: OpenSessionCommand) => boolean;
  close: (command: CloseSessionCommand) => boolean;
  getRecent: () => GameSession[] | null;
};

export type GameSessionServiceDeps = {
  logService: LogService;
  gameSessionRepository: GameSessionRepository;
  playniteGameRepository: PlayniteGameRepository;
};
