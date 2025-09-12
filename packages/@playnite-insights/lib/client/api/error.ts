import { ZodIssue } from "zod";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly cause?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    opts?: { cause?: unknown }
  ) {
    super();
    this.statusCode = 500;
    this.cause = opts?.cause;
  }
}

export class ValidationError extends ApiError {
  public readonly details?: ZodIssue[];

  constructor({
    message = "Validation error",
    details,
  }: {
    message?: string;
    details?: ZodIssue[];
  }) {
    super(message);
    this.details = details;
  }
}
