import type { OpenGameSessionRequestDto } from "./open-session.request.dto";

export type OpenGameSessionCommand = {
  clientUtcNow: string;
  sessionId: string;
  gameId: string;
  gameName?: string | null;
};

export const makeGameSessionCommand = (
  requestDto: OpenGameSessionRequestDto,
  gameName: string | null
): OpenGameSessionCommand => {
  return {
    clientUtcNow: requestDto.ClientUtcNow,
    sessionId: requestDto.SessionId,
    gameId: requestDto.GameId,
    gameName,
  };
};
