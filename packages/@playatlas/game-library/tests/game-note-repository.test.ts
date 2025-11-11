import {
  defaultFileSystemService,
  getDb,
  initDatabase,
  makeLogService,
} from "@playatlas/system/infra";
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
import { type GameNoteRepository } from "../src/core/types/repository/game-note";
import { makeGameNoteRepository } from "../src/infra/repository/game-note";

const mocks = makeMocks();
const gameNoteFactory = new GameNoteFactory();
let db: DatabaseSync;
let repo: GameNoteRepository;

describe("Game Note Repository", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    testUtils.clearAllTables(db);
    repo = makeGameNoteRepository({
      logService: mocks.logService,
      getDb: () => db,
    });
  });

  beforeAll(async () => {
    db = getDb({ inMemory: true });
    await initDatabase({
      db,
      fileSystemService: defaultFileSystemService,
      logService: makeLogService(),
      MIGRATIONS_DIR: mocks.config.MIGRATIONS_DIR,
    });
  });

  it("on reconciliation, add missing notes", () => {
    // Arrange
    const notes = gameNoteFactory.getNotes(100);
    const incomingNotes = gameNoteFactory.getNotes(50);
    // Act
    repo.addMany(notes);
    repo.reconcileFromSource(incomingNotes);
    const existingNotes = repo.all();
    // Assert
    expect(existingNotes).toBeTruthy();
    expect(existingNotes).toHaveLength(notes.length + incomingNotes.length);
  });

  it("on reconciliation, log info", () => {
    // Arrange
    const notes = gameNoteFactory.getNotes(100);
    // Act
    repo.reconcileFromSource(notes);
    const existingNotes = repo.all();
    // Assert
    expect(existingNotes).toBeTruthy();
    expect(mocks.logService.info).toHaveBeenCalledWith(
      expect.stringMatching(/started/i)
    );
  });

  it("on reconciliation, does not duplicate existing notes", () => {
    // Arrange
    const notes = gameNoteFactory.getNotes(200);
    // Act
    repo.addMany(notes);
    repo.reconcileFromSource(notes);
    const existingNotes = repo.all();
    // Assert
    expect(existingNotes).toHaveLength(notes.length);
  });

  it("on reconciliation, updates exiting notes using 'last write wins' strategy", () => {
    // Arrange
    const now = new Date();
    const future = new Date(now);
    future.setMinutes(now.getMinutes() + 5);
    const notes = gameNoteFactory.getNotes(200, {
      LastUpdatedAt: now.toISOString(),
    });
    // Act
    repo.addMany(notes);
    const updatedNotes = notes.map((note) => ({
      ...note,
      Content: "New Content!",
      LastUpdatedAt: future.toISOString(),
    }));
    repo.reconcileFromSource(updatedNotes);
    const existingNotes = repo.all();
    // Assert
    expect(existingNotes).toHaveLength(notes.length);
    expect(existingNotes.every((note) => note.Content === "New Content!")).toBe(
      true
    );
  });

  it("on reconciliation, handles empty source without error", () => {
    // Arrange
    const notes = gameNoteFactory.getNotes(10);
    // Act
    repo.addMany(notes);
    repo.reconcileFromSource([]);
    const existingNotes = repo.all();
    // Assert
    expect(existingNotes).toHaveLength(notes.length);
  });

  it("on reconciliation, adds all notes if repository is initially empty", () => {
    // Arrange
    const incomingNotes = gameNoteFactory.getNotes(200);
    // Act
    repo.reconcileFromSource(incomingNotes);
    const existingNotes = repo.all();
    // Assert
    expect(existingNotes).toHaveLength(incomingNotes.length);
  });

  it("on reconciliation, adds only missing notes", () => {
    // Arrange
    const notes = gameNoteFactory.getNotes(10);
    const incomingNotes = [
      ...notes.slice(0, 5),
      ...gameNoteFactory.getNotes(5),
    ];
    // Act
    repo.addMany(notes);
    repo.reconcileFromSource(incomingNotes);
    const existingNotes = repo.all();
    // Assert
    expect(existingNotes).toHaveLength(15);
  });

  it("on reconciliation, does not alter repository when reconciling the same dataset multiple times", () => {
    // Arrange
    const initialNotes = gameNoteFactory.getNotes(200);
    repo.addMany(initialNotes);
    repo.reconcileFromSource(initialNotes);
    const afterFirstReconcile = repo.all();
    expect(afterFirstReconcile).toHaveLength(initialNotes.length);
    // Act
    repo.reconcileFromSource(initialNotes);
    const afterSecondReconcile = repo.all();
    // Assert
    expect(afterSecondReconcile).toHaveLength(initialNotes.length);
    expect(afterSecondReconcile).toEqual(expect.arrayContaining(initialNotes));
  });

  afterAll(() => {
    db.close();
  });
});
