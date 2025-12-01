import { type LogServiceFactory } from "@playatlas/common/application";
import {
  makeCompanyRepository,
  makeCompletionStatusRepository,
  makeGameRepository,
  makeGenreRepository,
  makePlatformRepository,
  type CompanyRepository,
  type CompletionStatusRepository,
  type GameRepository,
  type GenreRepository,
  type PlatformRepository,
} from "@playatlas/game-library/infra";
import {
  makeGetAllGamesQueryHandler,
  type GetAllGamesQueryHandler,
} from "@playatlas/game-library/queries";
import { PlayAtlasApiInfra } from "./bootstrap.infra";

export type PlayAtlasApiGameLibrary = Readonly<{
  getCompanyRepository: () => CompanyRepository;
  getGenreRepository: () => GenreRepository;
  getGameRepository: () => GameRepository;
  getPlatformRepository: () => PlatformRepository;
  getCompletionStatusRepository: () => CompletionStatusRepository;
  queries: {
    getAllGamesHandler: () => GetAllGamesQueryHandler;
  };
}>;

export type BootstrapGameLibraryDeps = {
  getDb: PlayAtlasApiInfra["getDb"];
  logServiceFactory: LogServiceFactory;
};

export const bootstrapGameLibrary = ({
  getDb,
  logServiceFactory,
}: BootstrapGameLibraryDeps) => {
  const _company_repository = makeCompanyRepository({
    getDb,
    logService: logServiceFactory.build("CompanyRepository"),
  });
  const _genre_repository = makeGenreRepository({
    getDb,
    logService: logServiceFactory.build("GenreRepository"),
  });
  const _game_repository = makeGameRepository({
    getDb,
    logService: logServiceFactory.build("GameRepository"),
  });
  const _platform_repository = makePlatformRepository({
    getDb,
    logService: logServiceFactory.build("PlatformRepository"),
  });
  const _completion_status_repository = makeCompletionStatusRepository({
    getDb,
    logService: logServiceFactory.build("CompletionStatusRepository"),
  });
  const _query_handler_get_all_games = makeGetAllGamesQueryHandler({
    gameRepository: _game_repository,
  });

  const gameLibrary: PlayAtlasApiGameLibrary = {
    getCompanyRepository: () => _company_repository,
    getGameRepository: () => _game_repository,
    getGenreRepository: () => _genre_repository,
    getPlatformRepository: () => _platform_repository,
    getCompletionStatusRepository: () => _completion_status_repository,
    queries: {
      getAllGamesHandler: () => _query_handler_get_all_games,
    },
  };
  return Object.freeze(gameLibrary);
};
