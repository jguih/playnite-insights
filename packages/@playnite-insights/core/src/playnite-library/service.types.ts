import type { GetPlayniteLibraryMetricsResponse } from "@playnite-insights/lib/client";
import type { PlayniteLibraryMetricsRepository } from "../types";
import type { LogService } from "../types/log.types";

export type PlayniteLibraryServiceDeps = {
  logService: LogService;
  playniteLibraryMetricsRepository: PlayniteLibraryMetricsRepository;
};

export type PlayniteLibraryService = {
  getLibraryMetrics: () => GetPlayniteLibraryMetricsResponse;
};
