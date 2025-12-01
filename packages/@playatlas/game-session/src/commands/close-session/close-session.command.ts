import type { CloseGameSessionRequestDto } from "./close-session.request.dto";

export type CloseGameSessionCommand = {
  clientUtcNow: Date;
  sessionId: string;
  gameId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  gameName: string | null;
};

export const makeCloseGameSessionCommand = (
  requestDto: CloseGameSessionRequestDto,
  gameName: string | null
): CloseGameSessionCommand => {
  return {
    clientUtcNow: new Date(requestDto.ClientUtcNow),
    sessionId: requestDto.SessionId,
    gameId: requestDto.GameId,
    startTime: new Date(requestDto.StartTime),
    endTime: new Date(requestDto.EndTime),
    duration: requestDto.Duration,
    gameName,
  };
};
