import z from "zod";

export const appClientErrorDepsSchema = z.discriminatedUnion("code", [
  z.object({
    code: z.literal("invalid_syncid"),
    message: z.string().optional(),
  }),
  z.object({
    code: z.literal("sync_check_failed"),
    message: z.string().optional(),
  }),
  z.object({
    code: z.literal("reconciliation_failed"),
    message: z.string().optional(),
  }),
]);

export type AppClientErrorDeps = z.infer<typeof appClientErrorDepsSchema>;

export class AppClientError extends Error {
  public code: AppClientErrorDeps["code"];

  constructor(deps: AppClientErrorDeps, error: unknown) {
    super(deps.message, { cause: error });
    this.code = deps.code;
  }
}
