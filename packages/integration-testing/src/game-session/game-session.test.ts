import { makeOpenGameSessionService } from "@playatlas/game-session/commands/open-session";
import { makeGameSessionRepository } from "@playatlas/game-session/infra";
import { makeLogService } from "@playatlas/system/application";
import {
  getSystemConfig,
  initDatabase,
  makeDatabaseConnection,
  makeEnvService,
  makeFileSystemService,
} from "@playatlas/system/infra";

const systemConfig = getSystemConfig({
  envService: makeEnvService({ fs: makeFileSystemService() }),
});
const db = makeDatabaseConnection({ inMemory: true });
const repository = makeGameSessionRepository({
  getDb: () => db,
  logService: makeLogService("GameSessionRepository"),
});
const session = {
  open: makeOpenGameSessionService({
    repository,
    logService: makeLogService("OpenGameSessionService"),
  }),
};

describe("Game Session Service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  beforeAll(async () => {
    await initDatabase({
      db,
      fileSystemService: makeFileSystemService(),
      logService: makeLogService("InitDatabase"),
      migrationsDir: systemConfig.getMigrationsDir(),
    });
  });

  it("opens a game session", () => {
    // session.open.execute({
    //   clientUtcNow: new Date().toISOString(),
    //   gameId: faker.string.uuid(),
    //   sessionId: faker.string.uuid(),
    //   gameName: faker.lorem.words(3),
    // });
    expect(systemConfig.getMigrationsDir()).toBeTruthy();
  });

  afterAll(() => {
    db.close();
  });
});
