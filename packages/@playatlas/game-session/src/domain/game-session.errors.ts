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
    super("Cannot close an already closed session");
  }
}

export class GameSessionAlreadyStaleError extends GameSessionError {
  constructor() {
    super("Cannot mark a closed session as stale");
  }
}

export class EndTimeBeforeStartTimeError extends GameSessionError {
  constructor() {
    super("End time cannot be earlier than start time");
  }
}
