import {
  type GetRecentSessionsResponse,
  type CloseSessionCommand,
  type OpenSessionCommand,
} from "@playnite-insights/lib/client";
import type { GameSessionRepository } from "../game-session.types";
import type { LogService } from "../log.types";
import type { PlayniteGameRepository } from "../playnite-game.types";

export type GameSessionService = {
  open: (command: OpenSessionCommand) => boolean;
  close: (command: CloseSessionCommand) => boolean;
  getRecent: () => GetRecentSessionsResponse;
};

export type GameSessionServiceDeps = {
  logService: LogService;
  gameSessionRepository: GameSessionRepository;
  playniteGameRepository: PlayniteGameRepository;
};
