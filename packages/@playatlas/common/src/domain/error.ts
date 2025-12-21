export class InvalidStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidStateError";
  }
}

export class InvalidArgumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidArgumentError";
  }
}

export class InvalidOperationError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "InvalidOperationError";
  }
}

export class InvalidFileTypeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidFileTypeError";
  }
}
