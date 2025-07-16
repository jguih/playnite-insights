import { gamePageSizes, gameSortBy, gameSortOrder } from "./schemas";
import type { GamePageSize, GameSortBy, GameSortOrder } from "./types";

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
