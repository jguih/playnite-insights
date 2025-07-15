import { DashPageData } from "@playnite-insights/lib";
import { LogService } from "../log";
import { PlayniteLibrarySyncRepository } from "../playnite-library-sync";
import { PlayniteGameRepository } from "../playnite-game";

export type DashPageServiceDeps = {
  logService: LogService;
  playniteLibrarySyncRepository: PlayniteLibrarySyncRepository;
  playniteGameRepository: PlayniteGameRepository;
  /**
   * @returns The last 6 months names in ascending order and abreviated. Should include the current month.
   */
  getLastSixMonthsAbv: () => string[];
};

export type DashPageService = {
  getPageData: () => DashPageData | undefined;
};
