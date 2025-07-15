import z from "zod";
import { playniteGameSchema } from "../playnite-game";
import { developerSchema } from "../schemas";

export const gamePageDataSchema = z
  .object({
    game: z.object({
      ...playniteGameSchema.shape,
      Developers: z.array(developerSchema),
    }),
  })
  .optional();
