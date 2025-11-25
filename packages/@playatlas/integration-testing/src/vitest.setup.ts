import {
  makeCompanyRepository,
  makeCompletionStatusRepository,
  makeGenreRepository,
} from "@playatlas/game-library/infra";
import {
  makeCompanyFactory,
  makeCompletionStatusFactory,
  makeGenreFactory,
} from "@playatlas/game-library/testing";
import { makeConsoleLogService } from "@playatlas/system/application";
import { getSystemConfig } from "@playatlas/system/domain";
import {
  getDatabaseConnection,
  initDatabase,
  makeFileSystemService,
} from "@playatlas/system/infra";

const systemConfig = getSystemConfig();
const db = getDatabaseConnection({ inMemory: true });

beforeAll(async () => {
  await initDatabase({
    db,
    fileSystemService: makeFileSystemService(),
    logService: makeConsoleLogService("InitDatabase"),
    migrationsDir: systemConfig.getMigrationsDir(),
  });

  const completionStatusFactory = makeCompletionStatusFactory();
  const completionStatusRepo = makeCompletionStatusRepository({
    getDb: () => db,
    logService: makeConsoleLogService("CompletionStatusRepository"),
  });
  completionStatusRepo.upsertMany(
    completionStatusFactory.buildDefaultCompletionStatusList()
  );

  const companyFactory = makeCompanyFactory();
  const companyRepo = makeCompanyRepository({
    getDb: () => db,
    logService: makeConsoleLogService("CompanyRepository"),
  });
  companyRepo.upsertMany(companyFactory.buildCompanyList(50));

  const genreFactory = makeGenreFactory();
  const genreRepo = makeGenreRepository({
    getDb: () => db,
    logService: makeConsoleLogService("GenreRepository"),
  });
  genreRepo.upsertMany(genreFactory.buildGenreList(200));
});

afterAll(() => {
  db.close();
});
