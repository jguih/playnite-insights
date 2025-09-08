import type { PlayniteLibraryMetrics } from "@playnite-insights/lib/client";
import type { LogService } from "../log.types";
import type { PlayniteLibrarySyncRepository } from "../playnite-library-sync.types";

export type PlayniteLibraryServiceDeps = {
  logService: LogService;
  playniteLibrarySyncRepository: PlayniteLibrarySyncRepository;
  /**
   * @returns The last 6 months names in ascending order and abreviated. Should include the current month.
   */
  getLastSixMonthsAbv: () => string[];
};

export type PlayniteLibraryService = {
  getLibraryMetrics: () => PlayniteLibraryMetrics;
};
