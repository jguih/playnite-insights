import z from "zod";
import {
  gameManifestDataSchema,
  gamePageSizes,
  gameSortBy,
  gameSortOrder,
  playniteGameSchema,
} from "./schemas";

export type PlayniteGame = z.infer<typeof playniteGameSchema>;
export type GameManifestData = z.infer<typeof gameManifestDataSchema>;
export type GameSortBy = (typeof gameSortBy)[number];
export type GameSortOrder = (typeof gameSortOrder)[number];

export type GameFilters = {
  query: string | null;
  installed: string | null;
};

export type GameSorting = {
  order: GameSortOrder;
  by: GameSortBy;
};

export type GamePageSizes = typeof gamePageSizes;
export type GamePageSize = GamePageSizes[number];
