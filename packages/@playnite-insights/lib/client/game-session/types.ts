import z from "zod";
import { gameSessionSchema } from "./schemas";

export type GameSession = z.infer<typeof gameSessionSchema>;
