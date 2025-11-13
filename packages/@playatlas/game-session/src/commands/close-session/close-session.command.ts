import type { CloseGameSessionRequestDto } from "./close-session.request.dto";

export type CloseGameSessionCommand = {
  clientUtcNow: string;
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
    clientUtcNow: requestDto.clientUtcNow,
    sessionId: requestDto.sessionId,
    gameId: requestDto.gameId,
    startTime: new Date(requestDto.startTime),
    endTime: new Date(requestDto.endTime),
    duration: requestDto.duration,
    gameName,
  };
};
