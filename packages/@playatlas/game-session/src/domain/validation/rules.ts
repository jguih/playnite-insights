import { sessionStatus } from "../game-session.constants";
import type { GameSession } from "../game-session.entity";

export const isValidInProgressSession = (session: GameSession) => {
  return session.GameId !== null && session.Status === sessionStatus.inProgress;
};

export const isSessionClosed = (session: GameSession) => {
  return (
    session.getStatus() === "closed" &&
    session.getDuration() !== null &&
    session.getEndTime() !== null
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
