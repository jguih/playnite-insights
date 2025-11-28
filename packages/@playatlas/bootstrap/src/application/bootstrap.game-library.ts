import {
  type CompanyRepository,
  type GameRepository,
  type GenreRepository,
  makeCompanyRepository,
  makeGameRepository,
  makeGenreRepository,
  makePlatformRepository,
  type PlatformRepository,
} from "@playatlas/game-library/infra";
import { makeConsoleLogService } from "@playatlas/system/application";
import { PlayAtlasApiInfra } from "./bootstrap.infra";

export type PlayAtlasApiGameLibrary = Readonly<{
  getCompanyRepository: () => CompanyRepository;
  getGenreRepository: () => GenreRepository;
  getGameRepository: () => GameRepository;
  getPlatformRepository: () => PlatformRepository;
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

  const gameLibrary: PlayAtlasApiGameLibrary = {
    getCompanyRepository: () => _company_repository,
    getGameRepository: () => _game_repository,
    getGenreRepository: () => _genre_repository,
    getPlatformRepository: () => _platform_repository,
  };
  return Object.freeze(gameLibrary);
};
