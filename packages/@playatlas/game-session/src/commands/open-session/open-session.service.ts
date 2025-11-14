import type { LogService } from "@playatlas/common/domain";
import { makeGameSession } from "../../domain/game-session.entity";
import type { GameSessionRepository } from "../../infra/game-session.repository.port";
import { OpenGameSessionCommand } from "./open-session.command";

export type OpenGameSessionServiceDeps = {
  repository: GameSessionRepository;
  logger: LogService;
};

export const makeOpenGameSessionService = ({
  repository,
  logger,
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
      logger.info(
        `Created open session ${command.sessionId} for ${command.gameName}`
      );
    },
  };
};
