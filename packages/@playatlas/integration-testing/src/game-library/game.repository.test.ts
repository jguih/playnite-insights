import { faker } from "@faker-js/faker";
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

describe("Game Repository", () => {
  beforeAll(() => {
    const completionStatusOptions = repository.completionStatus.all();
    const companyOptions = repository.company.all().map((c) => c.getId());
    factory = {
      game: makeGameFactory({ completionStatusOptions, companyOptions }),
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
    const game = factory.game.buildGame();
    const gameDeveloperIds = game.relationships.developers.get();
    // Act
    repository.game.upsertMany([game]);
    const addedGame = repository.game.getById(game.getId(), {
      loadDevelopers: true,
    });
    const addedGameDeveloperIds = addedGame?.relationships.developers.get();
    // Assert
    expect(addedGame).toBeTruthy();
    expect(addedGame?.getId()).toBe(game.getId());
    expect(addedGame?.relationships.developers.isLoaded()).toBeTruthy();
    expect(addedGameDeveloperIds).toHaveLength(gameDeveloperIds.length);
    expect(new Set(addedGameDeveloperIds)).toEqual(new Set(gameDeveloperIds));
  });
});
