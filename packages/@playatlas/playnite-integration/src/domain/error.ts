export class PlayniteSynchronizationError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "PlayniteSynchronizationError";
  }
}
