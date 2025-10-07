import {
  GameNoteFactory,
  makeMocks,
  testUtils,
} from "@playnite-insights/testing";
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
import { makeGameNoteRepository } from "./repository";

const mocks = makeMocks();
const gameNoteFactory = new GameNoteFactory();
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
    const repo = makeGameNoteRepository({ logService: mocks.logService });
    const note = gameNoteFactory.getNote({ DeletedAt: null });
    repo.add(note);
    const existing = repo.getById(note.Id);
    expect(existing).toBeTruthy();
    expect(existing?.Title).toBe(note.Title);
    expect(existing?.DeletedAt).toBe(note.DeletedAt);
  });

  afterAll(() => {
    db.close();
  });
});
