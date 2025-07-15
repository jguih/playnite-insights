import { GameFilters, GameSorting, HomePageData } from "@playnite-insights/lib";
import { PlayniteGameRepository } from "../playnite-game";

export type HomePageServiceDeps = {
  playniteGameRepository: PlayniteGameRepository;
};

export type HomePageService = {
  getGames: (
    offset: number,
    pageSize: number,
    filters?: GameFilters,
    sorting?: GameSorting
  ) => HomePageData | undefined;
};
