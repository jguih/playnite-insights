import { GamePageData } from "@playnite-insights/lib";
import { PlayniteGameRepository } from "../playnite-game.types";

export type GamePageServiceDeps = {
  playniteGameRepository: PlayniteGameRepository;
};

export type GamePageService = {
  getData: (id: string) => GamePageData;
};
