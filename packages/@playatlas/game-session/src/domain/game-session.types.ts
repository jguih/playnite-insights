import type { sessionStatus } from "./game-session.constants";
import type { GameSession } from "./game-session.entity";

export type GameSessionStatusInProgress = (typeof sessionStatus)["inProgress"];
export type GameSessionStatusClosed = (typeof sessionStatus)["closed"];
export type GameSessionStatusStale = (typeof sessionStatus)["stale"];
export type GameSessionStatus =
  | GameSessionStatusClosed
  | GameSessionStatusInProgress
  | GameSessionStatusStale;

export type GameActivity = {
  status: "in_progress" | "not_playing";
  gameName: string | null;
  gameId: string | null;
  totalPlaytime: number;
  sessions: GameSession[];
};

export type MakeGameSessionProps = {
  sessionId: string;
  startTime: Date;
  gameId?: string | null;
  gameName?: string | null;
};

export type MakeClosedGameSessionProps = MakeGameSessionProps & {
  endTime: Date;
  duration: number;
};

export type CloseGameSessionProps = {
  endTime: Date;
  duration: number;
};
