import { HomePageService, HomePageServiceDeps } from "./service.types";

export const makeHomePageService = ({
  playniteGameRepository,
  developerRepository,
}: HomePageServiceDeps): HomePageService => {
  const getGames: HomePageService["getGames"] = (...props) => {
    return playniteGameRepository.getGamesForHomePage(...props);
  };

  const getDevs: HomePageService["getDevs"] = () => {
    return developerRepository.all();
  };

  return {
    getGames,
    getDevs,
  };
};
