import {
  type CompanyFactory,
  type CompletionStatusFactory,
  type GameFactory,
  type GenreFactory,
  makeCompanyFactory,
  makeCompletionStatusFactory,
  makeGenreFactory,
  makePlatformFactory,
  type PlatformFactory,
} from "@playatlas/game-library/testing";

export type PlayAtlasTestApiFactories = {
  getCompletionStatusFactory: () => CompletionStatusFactory;
  getGenreFactory: () => GenreFactory;
  getCompanyFactory: () => CompanyFactory;
  getGameFactory: () => GameFactory;
  setGameFactory: (factory: GameFactory) => void;
  getPlatformFactory: () => PlatformFactory;
};

export const bootstrapTestFactories = (): PlayAtlasTestApiFactories => {
  const _completionStatus = makeCompletionStatusFactory();
  const _genre = makeGenreFactory();
  const _company = makeCompanyFactory();
  let _gameFactory: GameFactory | null = null;
  const _platform = makePlatformFactory();

  return {
    getCompletionStatusFactory: () => _completionStatus,
    getGenreFactory: () => _genre,
    getCompanyFactory: () => _company,
    getGameFactory: (): GameFactory => {
      if (!_gameFactory) throw new Error("Game Factory not set!");
      return _gameFactory;
    },
    setGameFactory: (newFactory: GameFactory) => {
      _gameFactory = newFactory;
    },
    getPlatformFactory: () => _platform,
  };
};
