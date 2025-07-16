import {
  GamePageSize,
  GameSortBy,
  GameSortOrder,
  isValidGamePageSize,
  isValidGameSortBy,
  isValidGameSortOrder,
} from "../playnite-game";
import { homePageSearchParamsKeys } from "./schemas";

export const isValidPage = (value: string | null) => {
  if (!value) return true;
  return (
    Number.isFinite(Number(value)) &&
    Number.isInteger(Number(value)) &&
    Number(value) >= 0
  );
};

export const parseHomePageSearchParams = (params: URLSearchParams) => {
  // Pagination
  const _pageSize = params.get(homePageSearchParamsKeys.pageSize);
  const pageSize: GamePageSize = isValidGamePageSize(_pageSize)
    ? _pageSize
    : "100";
  const _page = params.get(homePageSearchParamsKeys.page);
  const page: string = _page && isValidPage(_page) ? _page : "1";
  const offset: number = (Number(page) - 1) * Number(pageSize);
  // Filtering
  const query = params.get(homePageSearchParamsKeys.query);
  const installed = params.get(homePageSearchParamsKeys.installed) === "1";
  const notInstalled =
    params.get(homePageSearchParamsKeys.notInstalled) === "1";
  // Sorting
  const _sortBy = params.get(homePageSearchParamsKeys.sortBy);
  const sortBy: GameSortBy = isValidGameSortBy(_sortBy) ? _sortBy : "Id";
  const _sortOrder = params.get(homePageSearchParamsKeys.sortOrder);
  const sortOrder: GameSortOrder = isValidGameSortOrder(_sortOrder)
    ? _sortOrder
    : "asc";

  return {
    pageSize,
    page,
    offset,
    query,
    installed,
    notInstalled,
    sortBy,
    sortOrder,
  };
};
