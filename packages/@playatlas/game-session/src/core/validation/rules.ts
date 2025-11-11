import { sessionStatus } from "../constants/game-session";
import type { GameSession } from "../types/game-session";
import type { CloseGameSessionArgs } from "../types/service/game-session";

export const isValidInProgressSession = (session: GameSession) => {
  return session.GameId !== null && session.Status === sessionStatus.inProgress;
};

export const isValidClosedSession = (session: GameSession) => {
  return (
    session.Status === sessionStatus.closed &&
    session.Duration !== null &&
    session.EndTime !== null
  );
};

export const isValidCloseCommand = (
  command: CloseGameSessionArgs
): command is CloseGameSessionArgs & {
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

export const isValidStaleCommand = (
  command: CloseGameSessionArgs
): command is CloseGameSessionArgs & {
  Status: typeof sessionStatus.stale;
} => {
  return command.Status === sessionStatus.stale;
};
