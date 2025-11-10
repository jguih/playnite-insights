import z from "zod";
import { gamePageSizes, gameSortBy, gameSortOrder } from "../constants/game";
import {
  fullGameRawSchema,
  fullGameSchema,
  gameSchema,
} from "../validation/schemas/game";

export type Game = z.infer<typeof gameSchema>;
export type FullGame = z.infer<typeof fullGameSchema>;
export type FullGameRaw = z.infer<typeof fullGameRawSchema>;

export type GameSortBy = (typeof gameSortBy)[number];
export type GameSortOrder = (typeof gameSortOrder)[number];
export type GameSorting = {
  order: GameSortOrder;
  by: GameSortBy;
};

export type GameFilters = {
  query?: string;
  installed?: boolean;
  hidden?: boolean;
};

export type GamePageSizes = typeof gamePageSizes;
export type GamePageSize = GamePageSizes[number];
