import type { PlayniteLibraryMetrics } from "@playnite-insights/lib/client";
import type {
  PlayniteLibraryService,
  PlayniteLibraryServiceDeps,
} from "./service.types";

export const makePlayniteLibraryService = ({
  logService,
  playniteLibrarySyncRepository,
  getLastSixMonthsAbv,
}: PlayniteLibraryServiceDeps): PlayniteLibraryService => {
  const getLibraryMetrics: PlayniteLibraryService["getLibraryMetrics"] = () => {
    const last6Months = getLastSixMonthsAbv();
    const gamesOwned =
      playniteLibrarySyncRepository.getGamesOwnedLastNMonths(6);
    const gamesOwnedLast6Months = gamesOwned.map((n, i) => {
      return {
        count: n,
        month: last6Months[i],
      } as PlayniteLibraryMetrics["gamesOwnedLast6Months"][number];
    });
    logService.debug(`Found metrics for playnite game library`);

    return {
      gamesOwnedLast6Months,
    };
  };
  return { getLibraryMetrics };
};
