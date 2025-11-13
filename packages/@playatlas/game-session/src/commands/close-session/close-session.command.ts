import type {
  GameSessionStatusClosed,
  GameSessionStatusStale,
} from "../../domain/game-session.types";
import type { CloseGameSessionRequestDto } from "./close-session.request.dto";

export type CloseGameSessionCommand = {
  ClientUtcNow: string;
  SessionId: string;
  GameId: string;
  StartTime: string;
  Status: GameSessionStatusClosed | GameSessionStatusStale;
  EndTime?: string | null;
  Duration?: string | null;
  GameName?: string | null;
};

export const makeCloseGameSessionCommand = (
  requestDto: CloseGameSessionRequestDto
): CloseGameSessionCommand => {
  return {
    ClientUtcNow: requestDto.ClientUtcNow,
    SessionId: requestDto.SessionId,
    GameId: requestDto.GameId,
    StartTime: requestDto.StartTime,
    Status: "closed",
  };
};
