import {
  GameSessionsDto,
  type CloseSessionCommand,
  type GameSession,
  type OpenSessionCommand,
} from "@playnite-insights/lib";
import type { GameSessionRepository } from "../game-session.types";
import type { LogService } from "../log.types";
import type { PlayniteGameRepository } from "../playnite-game.types";

export type GameSessionService = {
  open: (command: OpenSessionCommand) => boolean;
  close: (command: CloseSessionCommand) => boolean;
  recentActivity: (date: string | null) => GameSessionsDto;
};

export type GameSessionServiceDeps = {
  logService: LogService;
  gameSessionRepository: GameSessionRepository;
  playniteGameRepository: PlayniteGameRepository;
};
