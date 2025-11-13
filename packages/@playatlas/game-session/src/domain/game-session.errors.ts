import { sessionStatus } from "./game-session.constants";
import type { GameSessionId } from "./game-session.entity";

export class GameSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GameSessionError";
  }
}

export class GameSessionNotInProgressError extends GameSessionError {
  constructor() {
    super("Cannot close a session that is not in progress");
  }
}

export class GameSessionAlreadyClosedError extends GameSessionError {
  constructor() {
    super("Cannot close or stale an already closed session");
  }
}

export class GameSessionAlreadyStaleError extends GameSessionError {
  constructor() {
    super("Cannot close or stale an already stale session");
  }
}

export class EndTimeBeforeStartTimeError extends GameSessionError {
  constructor() {
    super("End time cannot be earlier than start time");
  }
}

export class InvalidClosedGameSessionError extends GameSessionError {
  constructor(props: { sessionId: GameSessionId }) {
    super(
      `Invalid session ${props.sessionId}: closed session must have end time and duration`
    );
  }
}

export class InvalidInProgressGameSessionError extends GameSessionError {
  constructor(props: { sessionId: GameSessionId }) {
    super(
      `Invalid session ${props.sessionId}: in progress session must not have end time and duration`
    );
  }
}

export class InvalidGameSessionStatusError extends GameSessionError {
  constructor(props: { sessionStatus: unknown }) {
    super(
      `Invalid game session status: ${
        props.sessionStatus
      }. Valid statuses are: ${Object.values(sessionStatus).join(", ")}`
    );
  }
}
