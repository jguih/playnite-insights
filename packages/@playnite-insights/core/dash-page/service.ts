import type { DashPageData } from "@playnite-insights/lib";
import type { DashPageService, DashPageServiceDeps } from "./service.types";

export const makeDashPageService = ({
  logService,
  playniteLibrarySyncRepository,
  playniteGameRepository,
  getLastSixMonthsAbv,
}: DashPageServiceDeps): DashPageService => {
  const getPageData = (): DashPageData => {
    const data = playniteGameRepository.getGamesForDashPage();
    const total = data.length;
    const isInstalled =
      data.length > 0 ? data.filter((g) => Boolean(g.IsInstalled)).length : 0;
    const notInstalled = total - isInstalled;
    const totalPlaytime =
      data.length > 0
        ? data.map((g) => g.Playtime).reduce((prev, current) => prev + current)
        : 0;
    const notPlayed =
      data.length > 0 ? data.filter((g) => g.Playtime === 0).length : 0;
    const played = total - notPlayed;
    const top10MostPlayedGames =
      playniteGameRepository.getTopMostPlayedGamesForDashPage(10);
    // Convert to hours
    const totalPlaytimeOverLast6Months = playniteLibrarySyncRepository
      .getTotalPlaytimeOverLast6Months()
      .map((p) => Math.ceil(p / 3600));
    const totalGamesOwnedOverLast6Months =
      playniteLibrarySyncRepository.getTotalGamesOwnedOverLast6Months();

    const charts: DashPageData["charts"] = {
      totalPlaytimeOverLast6Months: {
        xAxis: { data: getLastSixMonthsAbv() },
        series: {
          bar: { data: totalPlaytimeOverLast6Months },
        },
      },
      totalGamesOwnedOverLast6Months: {
        xAxis: { data: getLastSixMonthsAbv() },
        series: {
          bar: { data: totalGamesOwnedOverLast6Months },
        },
      },
    };
    logService.success(
      `Fetched all the data for dashboard page without issues`
    );
    return {
      total,
      isInstalled,
      notInstalled,
      totalPlaytime,
      notPlayed,
      played,
      charts,
      topMostPlayedGames: top10MostPlayedGames,
    };
  };

  return {
    getPageData,
  };
};
