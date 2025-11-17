import { makeCompletionStatusRepository } from "@playatlas/game-library/infra";
import { makeCompletionStatusFactory } from "@playatlas/game-library/testing";
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
});

afterAll(() => {
  db.close();
});
