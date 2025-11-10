import z from "zod";
import { gameNoteSchema } from "../../validation/schemas/game-note";

export const getAllGameNotesResponseSchema = z.array(gameNoteSchema);
export type GetAllGameNotesResponse = z.infer<
  typeof getAllGameNotesResponseSchema
>;

export const createGameNoteCommandSchema = gameNoteSchema;
export type CreateGameNoteCommand = z.infer<typeof createGameNoteCommandSchema>;
export const createGameNoteResponseSchema = gameNoteSchema;

export const updateGameNoteCommandSchema = gameNoteSchema;
export type UpdateGameNoteCommand = z.infer<typeof updateGameNoteCommandSchema>;
export const updateGameNoteResponseSchema = gameNoteSchema;
