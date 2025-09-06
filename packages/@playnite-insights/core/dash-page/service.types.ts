import type { DashPageData } from "@playnite-insights/lib/client";
import type { LogService } from "../log.types";
import type { PlayniteLibrarySyncRepository } from "../playnite-library-sync.types";
import type { PlayniteGameRepository } from "../playnite-game.types";
import type { GameSessionRepository } from "../game-session.types";

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
