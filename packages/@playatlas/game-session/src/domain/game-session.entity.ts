import {
  EndTimeBeforeStartTimeError,
  GameSessionAlreadyClosedError,
  GameSessionAlreadyStaleError,
  GameSessionNotInProgressError,
} from "./game-session.errors";
import type {
  CloseGameSessionProps,
  GameSessionStatus,
  MakeClosedGameSessionProps,
  MakeGameSessionProps,
} from "./game-session.types";

export type GameSessionId = string;
export type GameSessionStartTime = Date;
export type GameSessionEndTime = Date | null;
export type GameSessionGameId = string | null;
export type GameSessionGameName = string | null;
export type GameSessionDuration = number | null;

export type GameSession = {
  getSessionId(): GameSessionId;
  getStatus(): GameSessionStatus;
  getStartTime(): GameSessionStartTime;
  getEndTime(): GameSessionEndTime;
  getGameId(): GameSessionGameId;
  getGameName(): GameSessionGameName;
  getDuration(): GameSessionDuration;
  close(props: CloseGameSessionProps): void;
  stale(): void;
};

export const makeGameSession = (props: MakeGameSessionProps): GameSession => {
  const _sessionId: GameSessionId = props.sessionId;
  const _startTime: GameSessionStartTime = props.startTime;
  const _gameId: GameSessionGameId = props.gameId ?? null;
  const _gameName: GameSessionGameName = props.gameName ?? null;
  let _status: GameSessionStatus = "in_progress";
  let _endTime: GameSessionEndTime = null;
  let _duration: GameSessionDuration = null;

  const newSession: GameSession = {
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
      _endTime = props.endTime;
      _duration = props.duration;
      _status = "closed";
    },
    stale: () => {
      _status = "stale";
    },
  };
  return newSession;
};

export const makeClosedGameSession = (props: MakeClosedGameSessionProps) => {
  const _sessionId: GameSessionId = props.sessionId;
  const _startTime: GameSessionStartTime = props.startTime;
  const _gameId: GameSessionGameId = props.gameId ?? null;
  const _gameName: GameSessionGameName = props.gameName ?? null;
  let _status: GameSessionStatus = "closed";
  let _endTime: GameSessionEndTime = props.endTime;
  let _duration: GameSessionDuration = props.duration;

  const newSession: GameSession = {
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
      throw new GameSessionAlreadyStaleError();
    },
  };
  return newSession;
};

export const makeStaleGameSession = (props: MakeGameSessionProps) => {
  const _sessionId: GameSessionId = props.sessionId;
  const _startTime: GameSessionStartTime = props.startTime;
  const _gameId: GameSessionGameId = props.gameId ?? null;
  const _gameName: GameSessionGameName = props.gameName ?? null;
  let _status: GameSessionStatus = "stale";
  let _endTime: GameSessionEndTime = null;
  let _duration: GameSessionDuration = null;

  const newSession: GameSession = {
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
      throw new GameSessionAlreadyStaleError();
    },
  };
  return newSession;
};

export const closeGameSession = (session: GameSession) => {
  // Close game session logic and validation
};

export const staleGameSession = (session: GameSession) => {
  // Stale game session logic and validation
};
