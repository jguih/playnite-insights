import {
  GameFilters,
  GamePageSize,
  GameSorting,
  HomePageData,
} from "@playnite-insights/lib";
import { PlayniteGameRepository } from "../playnite-game.types";
import { DeveloperRepository } from "../developer.types";

export type HomePageServiceDeps = {
  playniteGameRepository: PlayniteGameRepository;
  developerRepository: DeveloperRepository;
};

export type HomePageService = {
  getData: (
    offset: number,
    pageSize: GamePageSize,
    filters?: GameFilters,
    sorting?: GameSorting
  ) => HomePageData | undefined;
};
