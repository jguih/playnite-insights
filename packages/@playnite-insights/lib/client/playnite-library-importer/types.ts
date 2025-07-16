import z from "zod";
import {
  incomingPlayniteGameDtoSchema,
  syncGameListCommandSchema,
} from "./schemas";

export type IncomingPlayniteGameDTO = z.infer<
  typeof incomingPlayniteGameDtoSchema
>;

export type SyncGameListCommand = z.infer<typeof syncGameListCommandSchema>;
