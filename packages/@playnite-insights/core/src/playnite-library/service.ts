import type { GetPlayniteLibraryMetricsResponse } from "@playnite-insights/lib/client";
import type {
  PlayniteLibraryService,
  PlayniteLibraryServiceDeps,
} from "./service.types";

export const makePlayniteLibraryService = ({
  logService,
  playniteLibrarySyncRepository,
}: PlayniteLibraryServiceDeps): PlayniteLibraryService => {
  const getLibraryMetrics: PlayniteLibraryService["getLibraryMetrics"] = () => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0–11

    const gamesOwned =
      playniteLibrarySyncRepository.getGamesOwnedLastNMonths(6);
    const gamesOwnedLast6Months = gamesOwned.map((n, i) => {
      const offset = gamesOwned.length - 1 - i;
      const monthIndex = (currentMonth - offset + 12) % 12;
      return {
        count: n,
        monthIndex: monthIndex,
      } as GetPlayniteLibraryMetricsResponse["gamesOwnedLast6Months"][number];
    });

    return {
      gamesOwnedLast6Months,
    };
  };
  return { getLibraryMetrics };
};
