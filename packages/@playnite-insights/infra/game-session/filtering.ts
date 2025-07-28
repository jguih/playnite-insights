import { GameSessionFilters } from "@playnite-insights/lib";

export const getWhereClauseAndParamsFromFilters = (
  filters?: GameSessionFilters
) => {
  const where: string[] = [];
  const params: string[] = [];

  if (filters.date) {
    where.push(`StartTime >= (?) AND StartTime < (?)`);
    params.push(filters.date.start, filters.date.end);
  }

  return { where: `WHERE ${where.join(" AND ")}`, params };
};
