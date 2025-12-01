import type { LogService } from "@playatlas/common/application";
import { makeGameSession } from "../../domain/game-session.entity";
import type { GameSessionRepository } from "../../infra/game-session.repository.port";
import { OpenGameSessionCommand } from "./open-session.command";

export type OpenGameSessionServiceDeps = {
  repository: GameSessionRepository;
  logService: LogService;
};

export const makeOpenGameSessionService = ({
  repository,
  logService,
}: OpenGameSessionServiceDeps) => {
  return {
    execute: (command: OpenGameSessionCommand): void => {
      const now = new Date();
      const session = makeGameSession({
        sessionId: command.sessionId,
        startTime: now,
        gameId: command.gameId,
        gameName: command.gameName,
      });
      repository.add(session);
      logService.info(
        `Created open session ${command.sessionId} for ${command.gameName}`
      );
    },
  };
};
