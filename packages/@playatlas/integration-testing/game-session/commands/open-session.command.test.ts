import { makeGameSessionRepository } from "@playatlas/game-session/infra";
import { makeConsoleLogService } from "@playatlas/system/application";
import { getSystemConfig } from "@playatlas/system/domain";
import { initDatabase, makeFileSystemService } from "@playatlas/system/infra";
import { DatabaseSync } from "node:sqlite";
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
const db = new DatabaseSync(":memory:");
const repository = makeGameSessionRepository({
  getDb: () => db,
  logService: makeConsoleLogService("GameSessionRepository"),
});

describe("Open Game Session Service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  beforeAll(async () => {
    await initDatabase({
      db,
      fileSystemService: makeFileSystemService(),
      logService: makeConsoleLogService("InitDatabase"),
      MIGRATIONS_DIR: systemConfig.getMigrationsDir(),
    });
  });

  it("works", () => {
    expect(systemConfig.getMigrationsDir()).toBeTruthy();
  });

  afterAll(() => {
    db.close();
  });
});
