import { DashPageData } from "@playnite-insights/lib";
import { LogService } from "../log.types";
import { PlayniteLibrarySyncRepository } from "../playnite-library-sync.types";
import { PlayniteGameRepository } from "../playnite-game.types";
import { GameSessionRepository } from "../game-session.types";

export type DashPageServiceDeps = {
  logService: LogService;
  playniteLibrarySyncRepository: PlayniteLibrarySyncRepository;
  playniteGameRepository: PlayniteGameRepository;
  gameSessionRepository: GameSessionRepository;
  /**
   * @returns The last 6 months names in ascending order and abreviated. Should include the current month.
   */
  getLastSixMonthsAbv: () => string[];
};

export type DashPageService = {
  getPageData: () => DashPageData;
};
