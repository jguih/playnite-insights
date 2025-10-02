import z, { type ZodIssue } from "zod";
import { gameNoteSchema } from "../game-notes";

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

const errorSchema = z.discriminatedUnion("code", [
  z.object({
    code: z.literal("instance_not_registered"),
    message: z.string().optional(),
  }),
  z.object({
    code: z.literal("invalid_request"),
    message: z.string().optional(),
  }),
  z.object({
    code: z.literal("not_authorized"),
    message: z.string().optional(),
  }),
  z.object({
    code: z.literal("note_already_exists"),
    note: gameNoteSchema,
  }),
  z.object({
    code: z.literal("missing_or_invalid_sync_id"),
    message: z.string().optional(),
  }),
  z.object({
    code: z.literal("invalid_iso_date"),
    message: z.string().optional(),
  }),
]);

export const apiErrorSchema = z.object({
  error: errorSchema,
});

export type ApiErrorCode = z.infer<typeof errorSchema>["code"];
export type ApiErrorResponse = z.infer<typeof apiErrorSchema>;
