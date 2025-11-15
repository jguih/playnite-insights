import {
  EndTimeBeforeStartTimeError,
  GameSessionAlreadyClosedError,
  GameSessionAlreadyStaleError,
  GameSessionNotInProgressError,
  InvalidGameSessionDurationError,
} from "./game-session.errors";
import type {
  CloseGameSessionProps,
  GameSessionStatus,
  MakeClosedGameSessionProps,
  MakeGameSessionProps,
} from "./game-session.types";

export type GameSessionId = string;
type GameSessionStartTime = Date;
type GameSessionEndTime = Date | null;
type GameSessionGameId = string | null;
type GameSessionGameName = string | null;
export type GameSessionDuration = number | null;

export type GameSession = Readonly<{
  getSessionId: () => GameSessionId;
  getStartTime: () => GameSessionStartTime;
  getStatus: () => GameSessionStatus;
  getEndTime: () => GameSessionEndTime;
  getGameId: () => GameSessionGameId;
  getGameName: () => GameSessionGameName;
  getDuration: () => GameSessionDuration;
  close(props: CloseGameSessionProps): void;
  stale: () => void;
}>;

export const makeGameSession = (props: MakeGameSessionProps): GameSession => {
  const _sessionId: GameSessionId = props.sessionId;
  const _startTime: GameSessionStartTime = props.startTime;
  const _gameId: GameSessionGameId = props.gameId ?? null;
  const _gameName: GameSessionGameName = props.gameName ?? null;
  let _status: GameSessionStatus = "in_progress";
  let _endTime: GameSessionEndTime = null;
  let _duration: GameSessionDuration = null;

  const newSession: GameSession = Object.freeze({
    getSessionId: () => _sessionId,
    getStatus: () => _status,
    getStartTime: () => _startTime,
    getEndTime: () => _endTime,
    getGameId: () => _gameId,
    getGameName: () => _gameName,
    getDuration: () => _duration,
    close: (props) => {
      if (_status !== "in_progress") throw new GameSessionNotInProgressError();
      if (props.endTime < _startTime) throw new EndTimeBeforeStartTimeError();
      if (props.duration < 0)
        throw new InvalidGameSessionDurationError({
          sessionDuration: props.duration,
        });
      _endTime = props.endTime;
      _duration = props.duration;
      _status = "closed";
    },
    stale: () => {
      _status = "stale";
    },
  });
  return newSession;
};

export const makeClosedGameSession = (
  props: MakeClosedGameSessionProps
): GameSession => {
  const _sessionId: GameSessionId = props.sessionId;
  const _startTime: GameSessionStartTime = props.startTime;
  const _gameId: GameSessionGameId = props.gameId ?? null;
  const _gameName: GameSessionGameName = props.gameName ?? null;
  let _status: GameSessionStatus = "closed";
  let _endTime: GameSessionEndTime = props.endTime;
  let _duration: GameSessionDuration = props.duration;

  const newSession: GameSession = Object.freeze({
    getSessionId: () => _sessionId,
    getStatus: () => _status,
    getStartTime: () => _startTime,
    getEndTime: () => _endTime,
    getGameId: () => _gameId,
    getGameName: () => _gameName,
    getDuration: () => _duration,
    close: () => {
      throw new GameSessionAlreadyClosedError();
    },
    stale: () => {
      throw new GameSessionAlreadyClosedError();
    },
  });
  return newSession;
};

export const makeStaleGameSession = (
  props: MakeGameSessionProps
): GameSession => {
  const _sessionId: GameSessionId = props.sessionId;
  const _startTime: GameSessionStartTime = props.startTime;
  const _gameId: GameSessionGameId = props.gameId ?? null;
  const _gameName: GameSessionGameName = props.gameName ?? null;
  let _status: GameSessionStatus = "stale";
  let _endTime: GameSessionEndTime = null;
  let _duration: GameSessionDuration = null;

  const newSession: GameSession = Object.freeze({
    getSessionId: () => _sessionId,
    getStatus: () => _status,
    getStartTime: () => _startTime,
    getEndTime: () => _endTime,
    getGameId: () => _gameId,
    getGameName: () => _gameName,
    getDuration: () => _duration,
    close: () => {
      throw new GameSessionAlreadyStaleError();
    },
    stale: () => {
      throw new GameSessionAlreadyStaleError();
    },
  });
  return newSession;
};
