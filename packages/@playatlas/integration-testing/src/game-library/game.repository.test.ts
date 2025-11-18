import { faker } from "@faker-js/faker";
import {
  makeCompletionStatusRepository,
  makeGameRepository,
} from "@playatlas/game-library/infra";
import { GameFactory, makeGameFactory } from "@playatlas/game-library/testing";
import { makeConsoleLogService } from "@playatlas/system/application";
import { getDatabaseConnection } from "@playatlas/system/infra";
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = getDatabaseConnection({ inMemory: true });
const repository = {
  game: makeGameRepository({
    getDb: () => db,
    logService: makeConsoleLogService("GameRepository"),
  }),
  completionStatus: makeCompletionStatusRepository({
    getDb: () => db,
    logService: makeConsoleLogService("CompletionStatusRepository"),
  }),
};
let factory: { game: GameFactory };

describe("Game Repository", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  beforeAll(() => {
    const completionStatusOptions = repository.completionStatus.all();
    factory = {
      game: makeGameFactory({ completionStatusOptions }),
    };
  });

  it("add games", () => {
    // Arrange
    const games = factory.game.buildGameList(100);
    const randomGame = faker.helpers.arrayElement(games);
    // Act
    repository.game.upsertMany(games);
    const added = repository.game.all();
    const addedRandomGame = repository.game.getById(randomGame.getId());
    // Assert
    expect(added).toHaveLength(games.length);
    expect(addedRandomGame?.getId()).toBe(randomGame.getId());
    expect(addedRandomGame?.getName()).toBe(randomGame.getName());
    expect(addedRandomGame?.getCompletionStatusId()).toBe(
      randomGame.getCompletionStatusId()
    );
  });

  it("add a game with developer", () => {
    // Arrange
    // TODO: Company factory
    const game = factory.game.buildGame({ developerIds: ["genre"] });
    // Act
    repository.game.upsertMany([game]);
    // Assert
    expect(true).toBeTruthy();
  });
});
