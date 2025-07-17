import { HomePageService, HomePageServiceDeps } from "./service.types";

export const makeHomePageService = ({
  playniteGameRepository,
  developerRepository,
}: HomePageServiceDeps): HomePageService => {
  const getData: HomePageService["getData"] = (...props) => {
    return {
      games: playniteGameRepository.getGamesForHomePage(...props),
      developers: developerRepository.all(),
    };
  };

  return {
    getData,
  };
};
