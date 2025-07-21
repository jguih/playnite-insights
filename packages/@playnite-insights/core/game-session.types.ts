import { GameSession } from "@playnite-insights/lib";

export type OpenSessionCommand = Pick<
  GameSession,
  "SessionId" | "GameId" | "StartTime"
>;
export type CloseSessionCommand = GameSession;

export type GameSessionService = {
  exists: (sessionId: GameSession["SessionId"]) => boolean;
  open: (command: OpenSessionCommand) => void;
  close: (command: CloseSessionCommand) => void;
};
