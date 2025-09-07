import type { DashPageData } from "@playnite-insights/lib/client";
import type { DashPageService, DashPageServiceDeps } from "./service.types";

export const makeDashPageService = ({
  logService,
  playniteLibrarySyncRepository,
  playniteGameRepository,
  gameSessionRepository,
  getLastSixMonthsAbv,
}: DashPageServiceDeps): DashPageService => {
  const getPageData = (): DashPageData => {
    const games = playniteGameRepository.getGamesForDashPage();
    const total = games.length;
    const isInstalled =
      games.length > 0 ? games.filter((g) => Boolean(g.IsInstalled)).length : 0;
    const notInstalled = total - isInstalled;
    const totalPlaytime =
      games.length > 0
        ? games.map((g) => g.Playtime).reduce((prev, current) => prev + current)
        : 0;
    const notPlayed =
      games.length > 0 ? games.filter((g) => g.Playtime === 0).length : 0;
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

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessions =
      gameSessionRepository.findAllBy({
        filters: {
          startTime: [
            {
              op: "between",
              start: sevenDaysAgo.toISOString(),
              end: now.toISOString(),
            },
          ],
        },
      }) ?? [];

    return {
      totalGamesInLibrary: total,
      isInstalled,
      notInstalled,
      totalPlaytimeSeconds: totalPlaytime,
      notPlayed,
      played,
      charts,
      topMostPlayedGames: top10MostPlayedGames,
      gameSessionsFromLast7Days: sessions,
    };
  };

  return {
    getPageData,
  };
};
