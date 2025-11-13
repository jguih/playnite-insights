import { sessionStatus } from "../../domain/game-session.constants";
import type { GameSession } from "../../domain/game-session.entity";
import type {
  GameSessionService,
  GameSessionServiceDeps,
} from "../../domain/game-session.service";
import * as rules from "../../domain/validation/rules";

export const makeGameSessionService = ({
  logService,
  gameSessionRepository,
}: GameSessionServiceDeps): GameSessionService => {
  const open: GameSessionService["open"] = (command) => {
    const startTime = new Date().toISOString();
    const newSession: GameSession = {
      SessionId: command.SessionId,
      GameId: command.GameId,
      GameName: command.GameName ?? null,
      StartTime: startTime,
      Status: sessionStatus.inProgress,
      EndTime: null,
      Duration: null,
    };
    const result = gameSessionRepository.add(newSession);
    if (result) {
      logService.info(
        `Created open session ${command.SessionId} for ${command.GameName}`
      );
    }
    return result;
  };

  const close: GameSessionService["close"] = (command) => {
    const existing = gameSessionRepository.getById(command.SessionId);

    if (existing) {
      if (rules.isSessionClosed(existing)) {
        logService.warning(
          `Attempted to close already closed session, skipping`
        );
        return false;
      }
      if (!rules.isValidInProgressSession(existing)) {
        logService.warning(
          `Failed to close session ${existing.SessionId}, existing in progress session is invalid and will be marked as stale`
        );
        existing.Status = sessionStatus.stale;
        return gameSessionRepository.update(existing);
      }
      if (rules.isValidStaleCommand(command)) {
        logService.info(
          `Marking existing in progress session (ID: ${existing.SessionId}) as stale`
        );
        existing.Status = command.Status;
        return gameSessionRepository.update(existing);
      }
      if (!rules.isValidCloseCommand(command)) {
        logService.warning(
          `Attempted to close session with invalid command. Duration and EndTime needs to be valid`
        );
        return false;
      }
      existing.Duration = command.Duration;
      existing.EndTime = new Date().toISOString();
      existing.Status = command.Status;
      const result = gameSessionRepository.update(existing);
      if (result) {
        logService.info(`Closed session ${existing.SessionId}`);
      }
      return result;
    }

    const clientUtcNow = new Date(command.ClientUtcNow).getTime();
    const serverUtcNow = Date.now();
    const driftMs = clientUtcNow - serverUtcNow;
    const startTime = new Date(new Date(command.StartTime).getTime() - driftMs);

    logService.info(
      `Calculated time drift between client (Playnite Insights Exporter) and server: ${driftMs}ms`
    );

    if (rules.isValidCloseCommand(command)) {
      const endTime = new Date(new Date(command.EndTime).getTime() - driftMs);
      const newSession: GameSession = {
        SessionId: command.SessionId,
        GameId: command.GameId,
        GameName: command.GameName ?? null,
        StartTime: startTime.toISOString(),
        Status: command.Status,
        EndTime: endTime.toISOString(),
        Duration: command.Duration,
      };
      const result = gameSessionRepository.add(newSession);
      if (result) {
        logService.info(
          `Created closed session ${command.SessionId} for ${command.GameName}`
        );
      }
      return result;
    }

    if (rules.isValidStaleCommand(command)) {
      const newSession: GameSession = {
        SessionId: command.SessionId,
        GameId: command.GameId,
        GameName: command.GameName ?? null,
        StartTime: startTime.toISOString(),
        Status: command.Status,
        EndTime: null,
        Duration: null,
      };
      const result = gameSessionRepository.add(newSession);
      if (result) {
        logService.info(
          `Created stale session ${command.SessionId} for ${command.GameName}`
        );
      }
      return result;
    }

    logService.warning(
      `Attempted to close session with invalid command or for non existent game`
    );
    return false;
  };

  const getRecent: GameSessionService["getRecent"] = () => {
    let sessions: GameSession[] | undefined = undefined;
    const today = new Date();
    const end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
    const start = new Date(end);
    start.setDate(end.getDate() - 7);

    const filters: GameSessionFilters = {
      startTime: [
        {
          op: "overlaps",
          start: start.toISOString(),
          end: end.toISOString(),
        },
      ],
      status: {
        op: "not in",
        types: ["stale"],
      },
    };
    sessions = gameSessionRepository.findAllBy({ filters });

    return sessions ?? null;
  };

  return { open, close, getRecent };
};
