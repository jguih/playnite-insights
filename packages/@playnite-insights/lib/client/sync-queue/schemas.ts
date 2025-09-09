import z from "zod";
import { gameNoteSchema } from "../game-notes";
import { ISODateSchema } from "../schemas";

const baseQueueItem = {
  Id: z.string(),
  Type: z.enum(["create", "update", "delete"]),
  CreatedAt: ISODateSchema,
  Status: z.enum(["pending", "synced", "failed"]),
};

export const syncQueueItemSchema = z.discriminatedUnion("Entity", [
  z.object({
    ...baseQueueItem,
    Entity: z.literal("gameNote"),
    Payload: gameNoteSchema,
  }),
  // later, you can add more entities
  // z.object({
  //   ...baseQueueItem,
  //   Entity: z.literal("otherEntity"),
  //   Payload: otherSchema,
  // }),
]);
