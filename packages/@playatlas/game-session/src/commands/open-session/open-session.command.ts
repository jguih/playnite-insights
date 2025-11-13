import type { OpenGameSessionRequestDto } from "./open-session.request.dto";

export type OpenGameSessionCommand = {
  ClientUtcNow: string;
  SessionId: string;
  GameId: string;
  StartTime: string;
  GameName?: string | null;
};

export const makeGameSessionCommand = (
  requestDto: OpenGameSessionRequestDto
): OpenGameSessionCommand => {
  return {
    ClientUtcNow: requestDto.ClientUtcNow,
    SessionId: requestDto.SessionId,
    GameId: requestDto.GameId,
    StartTime: requestDto.StartTime,
  };
};
