import {
  type CloseSessionCommand,
  type GameSession,
  type GameSessionFilters,
  sessionStatus,
} from "@playnite-insights/lib/client";
import {
  type GameSessionService,
  type GameSessionServiceDeps,
} from "./service.types";

export const makeGameSessionService = ({
  logService,
  gameSessionRepository,
  playniteGameRepository,
}: GameSessionServiceDeps): GameSessionService => {
  const _isValidInProgressSession = (session: GameSession) => {
    return (
      session.GameId !== null && session.Status === sessionStatus.inProgress
    );
  };

  const _isValidClosedSession = (session: GameSession) => {
    return (
      session.Status === sessionStatus.closed &&
      session.Duration !== null &&
      session.EndTime !== null
    );
  };

  const _isValidCloseCommand = (
    command: CloseSessionCommand
  ): command is CloseSessionCommand & {
    Duration: number;
    EndTime: string;
    Status: typeof sessionStatus.closed;
  } => {
    return (
      command.Duration !== undefined &&
      command.Duration !== null &&
      command.EndTime !== undefined &&
      command.EndTime !== null &&
      command.Status === sessionStatus.closed
    );
  };

  const _isValidStaleCommand = (
    command: CloseSessionCommand
  ): command is CloseSessionCommand & {
    Status: typeof sessionStatus.stale;
  } => {
    return command.Status === sessionStatus.stale;
  };

  const open: GameSessionService["open"] = (command) => {
    const existingGame = playniteGameRepository.getById(command.GameId);
    if (!existingGame) {
      logService.warning(
        `Attempted to open session for non existent game, skipping`
      );
      return false;
    }
    const startTime = new Date().toISOString();
    const newSession: GameSession = {
      SessionId: command.SessionId,
      GameId: command.GameId,
      GameName: existingGame.Name,
      StartTime: startTime,
      Status: sessionStatus.inProgress,
      EndTime: null,
      Duration: null,
    };
    const result = gameSessionRepository.add(newSession);
    if (result) {
      logService.info(
        `Created open session ${command.SessionId} for ${existingGame.Name}`
      );
    }
    return result;
  };

  const close: GameSessionService["close"] = (command) => {
    const existing = gameSessionRepository.getById(command.SessionId);

    if (existing) {
      if (_isValidClosedSession(existing)) {
        logService.warning(
          `Attempted to close already closed session, skipping`
        );
        return false;
      }
      if (!_isValidInProgressSession(existing)) {
        logService.warning(
          `Failed to close session ${existing.SessionId}, existing in progress session is invalid and will be marked as stale`
        );
        existing.Status = sessionStatus.stale;
        return gameSessionRepository.update(existing);
      }
      if (_isValidStaleCommand(command)) {
        logService.info(
          `Marking existing in progress session (ID: ${existing.SessionId}) as stale`
        );
        existing.Status = command.Status;
        return gameSessionRepository.update(existing);
      }
      if (!_isValidCloseCommand(command)) {
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

    const existingGame = playniteGameRepository.getById(command.GameId);
    const clientUtcNow = new Date(command.ClientUtcNow).getTime();
    const serverUtcNow = Date.now();
    const driftMs = clientUtcNow - serverUtcNow;
    const startTime = new Date(new Date(command.StartTime).getTime() - driftMs);

    logService.info(
      `Calculated time drift between client (Playnite Insights Exporter) and server: ${driftMs}ms`
    );

    if (_isValidCloseCommand(command) && existingGame) {
      const endTime = new Date(new Date(command.EndTime).getTime() - driftMs);
      const newSession: GameSession = {
        SessionId: command.SessionId,
        GameId: command.GameId,
        GameName: existingGame.Name,
        StartTime: startTime.toISOString(),
        Status: command.Status,
        EndTime: endTime.toISOString(),
        Duration: command.Duration,
      };
      const result = gameSessionRepository.add(newSession);
      if (result) {
        logService.info(
          `Created closed session ${command.SessionId} for ${existingGame.Name}`
        );
      }
      return result;
    }

    if (_isValidStaleCommand(command) && existingGame) {
      const newSession: GameSession = {
        SessionId: command.SessionId,
        GameId: command.GameId,
        GameName: existingGame.Name,
        StartTime: startTime.toISOString(),
        Status: command.Status,
        EndTime: null,
        Duration: null,
      };
      const result = gameSessionRepository.add(newSession);
      if (result) {
        logService.info(
          `Created stale session ${command.SessionId} for ${existingGame.Name}`
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
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    logService.debug(
      `Fetching game sessions between ${start.toISOString()} and ${end.toISOString()}`
    );

    const filters: GameSessionFilters = {
      startTime: [
        {
          op: "overlaps",
          start: start.toISOString(),
          end: end.toISOString(),
        },
      ],
    };
    sessions = gameSessionRepository.findAllBy({ filters });

    logService.debug(`Found ${sessions?.length ?? 0} sessions`);

    return sessions ?? null;
  };

  return { open, close, getRecent };
};
