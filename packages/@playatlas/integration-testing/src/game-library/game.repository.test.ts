import { faker } from "@faker-js/faker";
import {
  makeCompletionStatusRepository,
  makeGameRepository,
} from "@playatlas/game-library/infra";
import { makeGameFactory } from "@playatlas/game-library/testing";
import { makeConsoleLogService } from "@playatlas/system/application";
import { getDatabaseConnection } from "@playatlas/system/infra";
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = getDatabaseConnection({ inMemory: true });
const factory = {
  game: makeGameFactory(),
};
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
let completionStatusesIds: string[] = [];

describe("Game Repository", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  beforeAll(() => {
    completionStatusesIds = repository.completionStatus
      .all()
      .map((c) => c.getId());
  });

  it("add games", () => {
    // Arrange
    const games = factory.game.buildGameList(100, {
      completionStatusId: faker.helpers.arrayElement(completionStatusesIds),
    });
    const randomGame = faker.helpers.arrayElement(games);
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
});
