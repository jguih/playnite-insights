import type { GamePageSize, GameSortBy, GameSortOrder } from "../playnite-game";
import { homePageSearchParamsKeys } from "./schemas";

export type HomePageSearchParamKeys =
  (typeof homePageSearchParamsKeys)[keyof typeof homePageSearchParamsKeys];

export type HomePageFilterParams = {
  query: string | null;
  installed: boolean;
  notInstalled: boolean;
  developers: string[];
  publishers: string[];
  genres: string[];
  platforms: string[];
};

export type HomePageSortingParams = {
  sortBy: GameSortBy;
  sortOrder: GameSortOrder;
};

export type HomePagePaginationParams = {
  pageSize: GamePageSize;
  page: string;
};
