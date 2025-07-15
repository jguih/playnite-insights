import z from "zod";
import { gamePageDataSchema } from "../schemas";

export type GamePageData = z.infer<typeof gamePageDataSchema>;
