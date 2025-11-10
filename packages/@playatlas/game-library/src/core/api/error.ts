import { apiErrorSchema } from "@playatlas/system/core";
import z from "zod";
import { gameNoteSchema } from "../validation/schemas/game-note";

export const gameLibraryErrorSchema = z.discriminatedUnion("code", [
  ...apiErrorSchema.shape.error.options,
  z.object({
    code: z.literal("note_already_exists"),
    note: gameNoteSchema,
  }),
]);

export const gameLibraryApiErrorSchema = z.object({
  error: gameLibraryErrorSchema,
});

export type GameLibraryApiErrorResponse = z.infer<
  typeof gameLibraryApiErrorSchema
>;
export type GameLibraryApiErrorCode = z.infer<
  typeof gameLibraryErrorSchema
>["code"];
