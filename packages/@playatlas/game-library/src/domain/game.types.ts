import { gamePageSizes, gameSortBy, gameSortOrder } from "./game.constants";

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
