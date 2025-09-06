import type { GameSessionFilters } from "@playnite-insights/lib/client";

export const getWhereClauseAndParamsFromFilters = (
  filters?: GameSessionFilters
) => {
  const where: string[] = [];
  const params: string[] = [];

  if (filters?.startTime) {
    for (const startTimeFilter of filters.startTime) {
      switch (startTimeFilter.op) {
        case "between": {
          where.push(`StartTime >= (?) AND StartTime < (?)`);
          params.push(startTimeFilter.start, startTimeFilter.end);
          break;
        }
        case "eq": {
          where.push(`StartTime = (?)`);
          params.push(startTimeFilter.value);
          break;
        }
        case "gte": {
          where.push(`StartTime >= (?)`);
          params.push(startTimeFilter.value);
          break;
        }
        case "lte": {
          where.push(`StartTime <= (?)`);
          params.push(startTimeFilter.value);
          break;
        }
        case "overlaps": {
          where.push(`StartTime < (?) AND (EndTime >= (?) OR EndTime IS NULL)`);
          params.push(startTimeFilter.end, startTimeFilter.start);
          break;
        }
      }
    }
  }

  return { where: `WHERE ${where.join(" AND ")}`, params };
};
