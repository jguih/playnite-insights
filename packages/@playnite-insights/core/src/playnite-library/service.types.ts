import type { GetPlayniteLibraryMetricsResponse } from "@playnite-insights/lib/client";
import type { PlayniteLibrarySyncRepository } from "../types";
import type { LogService } from "../types/log.types";

export type PlayniteLibraryServiceDeps = {
  logService: LogService;
  playniteLibrarySyncRepository: PlayniteLibrarySyncRepository;
};

export type PlayniteLibraryService = {
  getLibraryMetrics: () => GetPlayniteLibraryMetricsResponse;
};
