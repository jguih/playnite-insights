import {
  makeClosedGameSession,
  makeGameSession,
  makeStaleGameSession,
  type GameSession,
} from "./domain/game-session.entity";
import {
  InvalidClosedGameSessionError,
  InvalidGameSessionStatusError,
  InvalidInProgressGameSessionError,
} from "./domain/game-session.errors";
import type { GameSessionModel } from "./infra/game-session.repository";

export const gameSessionMapper = {
  toPersistence: (session: GameSession): GameSessionModel => {
    const record: GameSessionModel = {
      SessionId: session.getSessionId(),
      GameId: session.getGameId(),
      GameName: session.getGameName(),
      StartTime: session.getStartTime().toISOString(),
      EndTime: session.getEndTime()?.toISOString() ?? null,
      Duration: session.getDuration(),
      Status: session.getStatus(),
    };
    return record;
  },
  toDomain: (session: GameSessionModel): GameSession => {
    switch (session.Status) {
      case "closed": {
        if (session.EndTime === null || session.Duration === null) {
          throw new InvalidClosedGameSessionError({
            sessionId: session.SessionId,
          });
        }
        return makeClosedGameSession({
          sessionId: session.SessionId,
          duration: session.Duration,
          endTime: new Date(session.EndTime),
          startTime: new Date(session.StartTime),
          gameId: session.GameId,
          gameName: session.GameName,
        });
      }
      case "in_progress": {
        if (session.EndTime !== null || session.Duration !== null) {
          throw new InvalidInProgressGameSessionError({
            sessionId: session.SessionId,
          });
        }
        return makeGameSession({
          sessionId: session.SessionId,
          startTime: new Date(session.StartTime),
          gameId: session.GameId,
          gameName: session.GameName,
        });
      }
      case "stale": {
        return makeStaleGameSession({
          sessionId: session.SessionId,
          startTime: new Date(session.StartTime),
          gameId: session.GameId,
          gameName: session.GameName,
        });
      }
      default:
        throw new InvalidGameSessionStatusError({
          sessionStatus: session.Status,
        });
    }
  },
};
