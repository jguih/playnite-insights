import type { LogService } from "@playatlas/shared/core";
import type { CloseGameSessionCommand } from "../commands/close-session/close-session.command";
import type { OpenGameSessionCommand } from "../commands/open-session/open-session.command";
import type { GameSessionRepository } from "../infra/game-session.repository.port";
import type { GameSession } from "./game-session.entity";

export type GameSessionService = {
  open: (args: OpenGameSessionCommand) => boolean;
  close: (args: CloseGameSessionCommand) => boolean;
  getRecent: () => GameSession[] | null;
};

export type GameSessionServiceDeps = {
  logService: LogService;
  gameSessionRepository: GameSessionRepository;
};
