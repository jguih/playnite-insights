import { GameSessionFilters } from "@playnite-insights/lib";

export const getWhereClauseAndParamsFromFilters = (
  filters?: GameSessionFilters
) => {
  const where: string[] = [];
  const params: string[] = [];

  if (filters.date) {
    where.push(`date(StartTime) = (?)`);
    params.push(filters.date);
  }

  return { where: `WHERE ${where.join(" AND ")}`, params };
};
