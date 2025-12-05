import z from "zod";

export const baseEntityPropsSchema = z.object({
  createdAt: z.date().optional(),
  lastUpdatedAt: z.date().optional(),
});

export type MakeBaseEntityProps<EntityId extends number | string> = z.infer<
  typeof baseEntityPropsSchema
> & {
  id?: EntityId;
};
