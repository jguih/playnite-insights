import z from "zod";

export const clientSyncReconciliationCommandSchema = z.object({
  notes: z.array(gameNoteSchema),
});
export type ClientSyncReconciliationCommand = z.infer<
  typeof clientSyncReconciliationCommandSchema
>;

export const serverSyncReconciliationResponseSchema = z.object({
  syncId: z.string(),
  notes: z.array(gameNoteSchema),
});
export type ServerSyncReconciliationResponse = z.infer<
  typeof serverSyncReconciliationResponseSchema
>;
