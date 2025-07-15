import { GamePageData } from "@playnite-insights/lib";
import { PlayniteGameRepository } from "../playnite-game";

export type GamePageServiceDeps = {
  playniteGameRepository: PlayniteGameRepository;
};

export type GamePageService = {
  getData: (id: string) => GamePageData;
};
