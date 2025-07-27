import {
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
  all: () => GameSession[] | undefined;
};

export type GameSessionServiceDeps = {
  logService: LogService;
  gameSessionRepository: GameSessionRepository;
  playniteGameRepository: PlayniteGameRepository;
};
