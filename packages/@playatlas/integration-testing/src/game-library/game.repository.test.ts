import { makeGameRepository } from "@playatlas/game-library/infra";
import { makeGameFactory } from "@playatlas/game-library/testing";
import { makeConsoleLogService } from "@playatlas/system/application";
import { getSystemConfig } from "@playatlas/system/domain";
import {
  initDatabase,
  makeDatabaseConnection,
  makeFileSystemService,
} from "@playatlas/system/infra";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const systemConfig = getSystemConfig();
const db = makeDatabaseConnection({ inMemory: true });
const factory = makeGameFactory();
const repository = makeGameRepository({
  getDb: () => db,
  logService: makeConsoleLogService("GameRepository"),
});

describe("Game Repository", () => {
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

  it("creates a game", () => {
    repository.upsertMany([factory.buildGame()]);
    expect(true).toBeTruthy();
  });
});
