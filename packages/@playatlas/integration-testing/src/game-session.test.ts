import { faker } from "@faker-js/faker";
import { makeOpenGameSessionService } from "@playatlas/game-session/commands/open-session";
import { makeGameSessionRepository } from "@playatlas/game-session/infra";
import { makeConsoleLogService } from "@playatlas/system/application";
import { getSystemConfig } from "@playatlas/system/domain";
import {
  initDatabase,
  makeDatabaseConnection,
  makeFileSystemService,
} from "@playatlas/system/infra";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const systemConfig = getSystemConfig();
const db = makeDatabaseConnection({ inMemory: true });
const repository = makeGameSessionRepository({
  getDb: () => db,
  logService: makeConsoleLogService("GameSessionRepository"),
});
const session = {
  open: makeOpenGameSessionService({
    repository,
    logService: makeConsoleLogService("OpenGameSessionService"),
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
      logService: makeConsoleLogService("InitDatabase"),
      migrationsDir: systemConfig.getMigrationsDir(),
    });
  });

  it("opens a game session", () => {
    session.open.execute({
      clientUtcNow: new Date().toISOString(),
      gameId: faker.string.uuid(),
      sessionId: faker.string.uuid(),
      gameName: faker.lorem.words(3),
    });
    expect(systemConfig.getMigrationsDir()).toBeTruthy();
  });

  afterAll(() => {
    db.close();
  });
});
