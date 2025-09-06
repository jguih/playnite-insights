import {
  type GameFilters,
  type GameSorting,
} from "@playnite-insights/lib/client";

export const getWhereClauseAndParamsFromFilters = (filters?: GameFilters) => {
  const where: string[] = [];
  const params: string[] = [];

  if (!filters) {
    return { where: "", params };
  }

  if (filters.query !== null) {
    where.push(`LOWER(Name) LIKE ?`);
    params.push(`%${filters.query.toLowerCase()}%`);
  }

  if (
    filters.installed !== null &&
    (filters.installed === "1" || filters.installed === "0")
  ) {
    where.push(`IsInstalled = ?`);
    params.push(filters.installed);
  }

  if (where.length === 0) {
    return { where: "", params };
  }

  return { where: `WHERE ${where.join(" AND ")}`, params };
};

export const getOrderByClause = (sorting?: GameSorting): string => {
  if (!sorting) return ` ORDER BY Id ASC`;
  const order = sorting.order.toUpperCase();
  switch (sorting.by) {
    case "IsInstalled": {
      return ` ORDER BY IsInstalled ${order}, Id ASC`;
    }
    case "Added": {
      return ` ORDER BY Added ${order}, Id ASC`;
    }
    case "LastActivity": {
      return ` ORDER BY LastActivity ${order}, Id ASC`;
    }
    case "Playtime": {
      return ` ORDER BY Playtime ${order}, Id ASC`;
    }
    default:
      return ` ORDER BY Id ASC`;
  }
};
