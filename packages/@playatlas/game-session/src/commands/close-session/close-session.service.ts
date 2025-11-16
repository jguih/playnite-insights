import type { LogService } from "@playatlas/common/domain";
import { makeClosedGameSession } from "../../domain/game-session.entity";
import type { GameSessionRepository } from "../../infra/game-session.repository.port";
import type { CloseGameSessionCommand } from "./close-session.command";

export type CloseGameSessionServiceDeps = {
  repository: GameSessionRepository;
  logService: LogService;
};

export type CloseGameSessionServiceResult = {
  created: boolean;
  closed: boolean;
};

export const makeCloseGameSessionService = ({
  repository,
  logService,
}: CloseGameSessionServiceDeps) => {
  return {
    execute: (
      command: CloseGameSessionCommand
    ): CloseGameSessionServiceResult => {
      const session = repository.getById(command.sessionId);
      const serverUtcNow = Date.now();

      if (!session) {
        logService.warning(
          `Session not found: ${command.sessionId}. Creating closed session...`
        );

        const clientUtcNow = command.clientUtcNow.getTime();
        const driftMs = clientUtcNow - serverUtcNow;
        const startTime = new Date(
          new Date(command.startTime).getTime() - driftMs
        );
        const endTime = new Date(new Date(command.endTime).getTime() - driftMs);

        logService.info(
          `Calculated time drift between client (Playnite Insights Exporter) and server: ${driftMs}ms`
        );

        const closed = makeClosedGameSession({
          sessionId: command.sessionId,
          gameId: command.gameId,
          gameName: command.gameName,
          startTime: startTime,
          endTime: endTime,
          duration: command.duration,
        });
        repository.add(closed);

        logService.info(
          `Created closed session ${command.sessionId} for ${command.gameName}`
        );
        return { created: true, closed: false };
      }

      session.close({
        endTime: new Date(serverUtcNow),
        duration: command.duration,
      });

      repository.update(session);
      logService.info(`Closed session ${session.getSessionId()}`);
      return { created: false, closed: true };
    },
  };
};
