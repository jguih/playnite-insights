import { HomePageServiceDeps } from "./service.types";

export const makeHomePageService = ({
  playniteGameRepository,
}: HomePageServiceDeps) => {
  const getGames = playniteGameRepository.getGamesForHomePage;

  return {
    getGames,
  };
};
