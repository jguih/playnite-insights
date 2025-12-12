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
  makeGetAllCompaniesQueryHandler,
  makeGetAllGamesQueryHandler,
  makeGetAllPlatformQueryHandler,
  type GetAllCompaniesQueryHandler,
  type GetAllGamesQueryHandler,
  type GetAllPlatformsQueryHandler,
} from "@playatlas/game-library/queries";
import type { PlayAtlasApiInfra } from "./bootstrap.infra";

export type PlayAtlasApiGameLibrary = Readonly<{
  getCompanyRepository: () => CompanyRepository;
  getGenreRepository: () => GenreRepository;
  getGameRepository: () => GameRepository;
  getPlatformRepository: () => PlatformRepository;
  getCompletionStatusRepository: () => CompletionStatusRepository;
  queries: {
    getGetAllGamesQueryHandler: () => GetAllGamesQueryHandler;
    getGetAllCompaniesQueryHandler: () => GetAllCompaniesQueryHandler;
    getGetAllPlatformsQueryHandler: () => GetAllPlatformsQueryHandler;
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
  const _query_handler_get_all_companies = makeGetAllCompaniesQueryHandler({
    companyRepository: _company_repository,
  });
  const _query_handler_get_all_platforms = makeGetAllPlatformQueryHandler({
    platformRepository: _platform_repository,
  });

  const gameLibrary: PlayAtlasApiGameLibrary = {
    getCompanyRepository: () => _company_repository,
    getGameRepository: () => _game_repository,
    getGenreRepository: () => _genre_repository,
    getPlatformRepository: () => _platform_repository,
    getCompletionStatusRepository: () => _completion_status_repository,
    queries: {
      getGetAllGamesQueryHandler: () => _query_handler_get_all_games,
      getGetAllCompaniesQueryHandler: () => _query_handler_get_all_companies,
      getGetAllPlatformsQueryHandler: () => _query_handler_get_all_platforms,
    },
  };
  return Object.freeze(gameLibrary);
};
