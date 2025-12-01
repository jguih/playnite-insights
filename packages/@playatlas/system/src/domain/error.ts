export class InvalidServerConfigurationError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "InvalidServerConfiguration";
    this.cause = cause;
  }
}

export class InvalidEnvironmentVariableValueError extends InvalidServerConfigurationError {
  constructor(message: string, context: { envName: string; cause?: unknown }) {
    super(
      `Incorrect value for env variable ${context.envName}: ${message}`,
      context.cause
    );
  }
}
