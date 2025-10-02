import {
  type GamePageSize,
  type GameSortBy,
  type GameSortOrder,
  gamePageSizes,
  gameSortBy,
  gameSortOrder,
} from "../playnite-game";
import { homePageSearchParamsKeys } from "./schemas";
import type {
  HomePageFilterParams,
  HomePagePaginationParams,
  HomePageSortingParams,
} from "./types";

export const isValidPage = (value: string | null) => {
  if (!value) return true;
  return (
    Number.isFinite(Number(value)) &&
    Number.isInteger(Number(value)) &&
    Number(value) >= 0
  );
};

export const isValidGameSortBy = (
  value: string | null
): value is GameSortBy => {
  return gameSortBy.includes(value as GameSortBy);
};

export const isValidGameSortOrder = (
  value: string | null
): value is GameSortOrder => {
  return gameSortOrder.includes(value as GameSortOrder);
};

export const isValidGamePageSize = (
  value: string | null
): value is GamePageSize => {
  if (!value) return false;
  return (
    Number.isFinite(Number(value)) &&
    Number.isInteger(Number(value)) &&
    gamePageSizes.includes(value as GamePageSize)
  );
};

export const parseHomePageSearchParams = (
  params: URLSearchParams
): {
  pagination: HomePagePaginationParams;
  filter: HomePageFilterParams;
  sorting: HomePageSortingParams;
} => {
  // Pagination
  const _pageSize = params.get(homePageSearchParamsKeys.pageSize);
  const pageSize: GamePageSize = isValidGamePageSize(_pageSize)
    ? _pageSize
    : "100";
  const _page = params.get(homePageSearchParamsKeys.page);
  const page: string = _page && isValidPage(_page) ? _page : "1";
  // Filtering
  const query = params.get(homePageSearchParamsKeys.query);
  const installed = params.get(homePageSearchParamsKeys.installed) === "1";
  const notInstalled =
    params.get(homePageSearchParamsKeys.notInstalled) === "1";
  const developers = params.getAll(homePageSearchParamsKeys.developer);
  const publishers = params.getAll(homePageSearchParamsKeys.publisher);
  const genres = params.getAll(homePageSearchParamsKeys.genre);
  const platforms = params.getAll(homePageSearchParamsKeys.platform);
  // Sorting
  const _sortBy = params.get(homePageSearchParamsKeys.sortBy);
  const sortBy: GameSortBy = isValidGameSortBy(_sortBy)
    ? _sortBy
    : gameSortBy[0];
  const _sortOrder = params.get(homePageSearchParamsKeys.sortOrder);
  const sortOrder: GameSortOrder = isValidGameSortOrder(_sortOrder)
    ? _sortOrder
    : "asc";

  return {
    pagination: { pageSize, page },
    filter: {
      query,
      installed,
      notInstalled,
      developers,
      publishers,
      genres,
      platforms,
    },
    sorting: { sortBy, sortOrder },
  };
};
