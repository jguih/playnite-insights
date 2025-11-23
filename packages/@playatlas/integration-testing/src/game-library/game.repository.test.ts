import { faker } from "@faker-js/faker";
import { GameRelationship, type Game } from "@playatlas/game-library/domain";
import {
  makeCompanyRepository,
  makeCompletionStatusRepository,
  makeGameRepository,
} from "@playatlas/game-library/infra";
import { GameFactory, makeGameFactory } from "@playatlas/game-library/testing";
import { makeConsoleLogService } from "@playatlas/system/application";
import { getDatabaseConnection } from "@playatlas/system/infra";
import { describe, expect, it } from "vitest";

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
  company: makeCompanyRepository({
    getDb: () => db,
    logService: makeConsoleLogService("CompanyRepository"),
  }),
};
let factory: { game: GameFactory };

const assertRelationshipLoad = (
  game: Game,
  relationshipKey: GameRelationship
) => {
  repository.game.upsertMany([game]);
  const loaded = repository.game.getById(game.getId(), {
    load: { [relationshipKey]: true },
  });
  const originalIds = game.relationships[relationshipKey].get();
  const loadedIds = loaded?.relationships[relationshipKey].get();
  expect(loaded).toBeTruthy();
  expect(loaded?.getId()).toBe(game.getId());
  expect(loaded?.relationships[relationshipKey].isLoaded()).toBeTruthy();
  // Expect other relationships to not be loaded
  for (const key of Object.keys(game.relationships) as GameRelationship[]) {
    if (key !== relationshipKey) {
      expect(loaded?.relationships[key].isLoaded()).toBeFalsy();
    }
  }
  expect(loadedIds).toHaveLength(originalIds.length);
  expect(new Set(loadedIds)).toEqual(new Set(originalIds));
};

describe("Game Repository", () => {
  beforeAll(() => {
    const completionStatusOptions = repository.completionStatus.all();
    const companyOptions = repository.company.all().map((c) => c.getId());
    factory = {
      game: makeGameFactory({ completionStatusOptions, companyOptions }),
    };
  });

  it("persists games", () => {
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

  it("persists a game and eager load its developers when requested", () => {
    assertRelationshipLoad(factory.game.buildGame(), "developers");
  });

  it("persists a game and eager load its publishers when requested", () => {
    assertRelationshipLoad(factory.game.buildGame(), "publishers");
  });

  // it("persists a game and eager load its genres when requested", () => {
  //   assertRelationshipLoad(factory.game.buildGame(), "genres");
  // });
});
