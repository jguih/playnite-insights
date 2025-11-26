import {
  makeCompanyRepository,
  makeCompletionStatusRepository,
  makeGameRepository,
  makeGenreRepository,
} from "@playatlas/game-library/infra";
import {
  GameFactory,
  makeCompanyFactory,
  makeCompletionStatusFactory,
  makeGameFactory,
  makeGenreFactory,
} from "@playatlas/game-library/testing";
import { makeConsoleLogService } from "@playatlas/system/application";
import { getSystemConfig } from "@playatlas/system/domain";
import {
  initDatabase,
  makeDatabaseConnection,
  makeFileSystemService,
} from "@playatlas/system/infra";

const systemConfig = getSystemConfig();
let db = makeDatabaseConnection({ inMemory: true });
export const getDb = () => db;

const resetDatabaseAsync = async () => {
  db.close();
  db = makeDatabaseConnection({ inMemory: true });
  await initDatabase({
    db,
    fileSystemService: makeFileSystemService(),
    logService: makeConsoleLogService("InitDatabase"),
    migrationsDir: systemConfig.getMigrationsDir(),
  });
};

const repository = {
  game: makeGameRepository({
    getDb,
    logService: makeConsoleLogService("GameRepository"),
  }),
  completionStatus: makeCompletionStatusRepository({
    getDb,
    logService: makeConsoleLogService("CompletionStatusRepository"),
  }),
  company: makeCompanyRepository({
    getDb,
    logService: makeConsoleLogService("CompanyRepository"),
  }),
  genre: makeGenreRepository({
    getDb,
    logService: makeConsoleLogService("GenreRepository"),
  }),
};
export const getRepositories = () => repository;

const makeFactories = () => {
  const _completionStatus = makeCompletionStatusFactory();
  const _genre = makeGenreFactory();
  const _company = makeCompanyFactory();
  let _gameFactory: GameFactory | null = null;

  return {
    getCompletionStatus: () => _completionStatus,
    getGenre: () => _genre,
    getCompany: () => _company,
    getGame: (): GameFactory => {
      if (!_gameFactory) throw new Error("Game Factory not set!");
      return _gameFactory;
    },
    setGame: (newFactory: GameFactory) => {
      _gameFactory = newFactory;
    },
  };
};
const factory = makeFactories();
export const getFactories = () => factory;

beforeEach(async () => {
  await resetDatabaseAsync();
  repository.completionStatus.upsertMany(
    factory.getCompletionStatus().buildDefaultCompletionStatusList()
  );
  repository.company.upsertMany(factory.getCompany().buildCompanyList(200));
  repository.genre.upsertMany(factory.getGenre().buildGenreList(200));

  const completionStatusOptions = repository.completionStatus.all();
  const companyOptions = repository.company.all().map((c) => c.getId());
  const genreOptions = repository.genre.all().map((g) => g.getId());
  factory.setGame(
    makeGameFactory({ companyOptions, completionStatusOptions, genreOptions })
  );
});
