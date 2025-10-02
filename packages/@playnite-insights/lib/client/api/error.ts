import z, { type ZodIssue } from "zod";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly cause?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    opts?: { cause?: unknown }
  ) {
    super(message);
    this.statusCode = statusCode;
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
    super(message, 400);
    this.details = details;
  }
}

export const apiErrorSchema = z.object({
  error: z.object({
    message: z.string().optional(),
    code: z.enum([
      "instance_not_registered",
      "invalid_request",
      "not_authorized",
    ]),
  }),
});

export type ApiErrorCode = z.infer<
  typeof apiErrorSchema.shape.error.shape.code
>;
