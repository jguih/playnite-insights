import z from "zod";
import { gameNoteSchema } from "../game-notes";

export class ApiError extends Error {
  public readonly response: ApiErrorResponse;
  public readonly statusCode: number;
  public readonly cause?: unknown;

  constructor(
    response: ApiErrorResponse,
    message: string,
    statusCode: number = 500,
    opts?: { cause?: unknown }
  ) {
    super(message);
    this.response = response;
    this.statusCode = statusCode;
    this.cause = opts?.cause;
  }
}

const errorSchema = z.discriminatedUnion("code", [
  z.object({
    code: z.literal("instance_not_registered"),
    message: z.string().optional(),
  }),
  z.object({
    code: z.literal("instance_already_registered"),
    message: z.string().optional(),
  }),
  z.object({
    code: z.literal("not_found"),
    message: z.string().optional(),
  }),
  z.object({
    code: z.literal("bad_request"),
    message: z.string().optional(),
  }),
  z.object({
    code: z.literal("internal_error"),
    message: z.string().optional(),
  }),
  z.object({
    code: z.literal("validation_error"),
    message: z.string().optional(),
    issues: z.array(
      z.object({
        path: z.string(),
        message: z.string(),
      })
    ),
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
