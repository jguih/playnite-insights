import {
  makeCompanyRepository,
  makeGameRepository,
  makeGenreRepository,
  makePlatformRepository,
  type CompanyRepository,
  type GameRepository,
  type GenreRepository,
  type PlatformRepository,
} from "@playatlas/game-library/infra";
import {
  makeGetAllGamesQueryHandler,
  type GetAllGamesQueryHandler,
} from "@playatlas/game-library/queries";
import { makeConsoleLogService } from "@playatlas/system/application";
import { PlayAtlasApiInfra } from "./bootstrap.infra";

export type PlayAtlasApiGameLibrary = Readonly<{
  getCompanyRepository: () => CompanyRepository;
  getGenreRepository: () => GenreRepository;
  getGameRepository: () => GameRepository;
  getPlatformRepository: () => PlatformRepository;
  queries: {
    getAllGamesHandler: () => GetAllGamesQueryHandler;
  };
}>;

export type BootstrapGameLibraryDeps = { getDb: PlayAtlasApiInfra["getDb"] };

export const bootstrapGameLibrary = ({ getDb }: BootstrapGameLibraryDeps) => {
  const _company_repository = makeCompanyRepository({
    getDb,
    logService: makeConsoleLogService("CompanyRepository"),
  });
  const _genre_repository = makeGenreRepository({
    getDb,
    logService: makeConsoleLogService("GenreRepository"),
  });
  const _game_repository = makeGameRepository({
    getDb,
    logService: makeConsoleLogService("GameRepository"),
  });
  const _platform_repository = makePlatformRepository({
    getDb,
    logService: makeConsoleLogService("PlatformRepository"),
  });
  const _query_handler_get_all_games = makeGetAllGamesQueryHandler({
    gameRepository: _game_repository,
  });

  const gameLibrary: PlayAtlasApiGameLibrary = {
    getCompanyRepository: () => _company_repository,
    getGameRepository: () => _game_repository,
    getGenreRepository: () => _genre_repository,
    getPlatformRepository: () => _platform_repository,
    queries: {
      getAllGamesHandler: () => _query_handler_get_all_games,
    },
  };
  return Object.freeze(gameLibrary);
};
