export class InvalidServerConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidServerConfiguration";
  }
}

export class InvalidEnvironmentVariableValueError extends InvalidServerConfigurationError {
  constructor(message: string, context: { envName: string; cause?: unknown }) {
    super(`Incorrect value for env variable ${context.envName}: ${message}`);
    this.cause = context.cause;
  }
}
