import {
  type CloseSessionCommand,
  type GameSession,
  sessionStatus,
} from "@playnite-insights/lib";
import { GameSessionService, GameSessionServiceDeps } from "./service.types";

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
    const newSession: GameSession = {
      SessionId: command.SessionId,
      GameId: command.GameId,
      StartTime: command.StartTime,
      Status: sessionStatus.inProgress,
      EndTime: null,
      Duration: null,
    };
    const result = gameSessionRepository.add(newSession);
    if (result) {
      logService.info(
        `Create open session ${command.SessionId} for ${existingGame.Name}`
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
      if (!_isValidCloseCommand(command)) {
        logService.warning(
          `Attempted to close session with invalid command. Duration and EndTime needs to be valid`
        );
        return false;
      }
      existing.Duration = command.Duration;
      existing.EndTime = command.EndTime;
      existing.Status = command.Status;
      const result = gameSessionRepository.update(existing);
      if (result) {
        logService.info(`Closed session ${existing.SessionId}`);
      }
      return result;
    }

    if (_isValidCloseCommand(command)) {
      const newSession: GameSession = {
        SessionId: command.SessionId,
        GameId: command.GameId,
        StartTime: command.StartTime,
        Status: command.Status,
        EndTime: command.EndTime,
        Duration: command.Duration,
      };
      const result = gameSessionRepository.add(newSession);
      if (result) {
        logService.info(`Created closed session ${command.SessionId}`);
      }
      return result;
    }

    if (_isValidStaleCommand(command)) {
      const newSession: GameSession = {
        SessionId: command.SessionId,
        GameId: command.GameId,
        StartTime: command.StartTime,
        Status: command.Status,
        EndTime: null,
        Duration: null,
      };
      const result = gameSessionRepository.add(newSession);
      if (result) {
        logService.info(`Created stale session ${command.SessionId}`);
      }
      return result;
    }

    logService.warning(`Attempted to close session with invalid command`);
    return false;
  };

  const all: GameSessionService["all"] = () => {
    return gameSessionRepository.all();
  };

  return { open, close, all };
};
