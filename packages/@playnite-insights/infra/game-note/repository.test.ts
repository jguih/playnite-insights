import { makeMocks, testUtils } from "@playnite-insights/testing";
import type { DatabaseSync } from "node:sqlite";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { getDb } from "../database/database";
import { initDatabase } from "../database/init";
import { defaultFileSystemService } from "../services/file-system";

const mocks = makeMocks();
let db: DatabaseSync;

describe("Game Note Repository", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    testUtils.clearAllTables(db);
  });

  beforeAll(async () => {
    db = getDb({ inMemory: true });
    await initDatabase({
      db,
      fileSystemService: defaultFileSystemService,
      logService: mocks.logService,
      MIGRATIONS_DIR: mocks.config.MIGRATIONS_DIR,
    });
  });

  it("works", () => {
    expect(true).toBeTruthy();
  });

  afterAll(() => {
    db.close();
  });
});
