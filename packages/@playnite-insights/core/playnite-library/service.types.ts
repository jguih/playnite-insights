import type { GetPlayniteLibraryMetricsResponse } from "@playnite-insights/lib/client";
import type { LogService } from "../log.types";
import type { PlayniteLibrarySyncRepository } from "../playnite-library-sync.types";

export type PlayniteLibraryServiceDeps = {
  logService: LogService;
  playniteLibrarySyncRepository: PlayniteLibrarySyncRepository;
};

export type PlayniteLibraryService = {
  getLibraryMetrics: () => GetPlayniteLibraryMetricsResponse;
};
