import { faker } from "@faker-js/faker";
import { GameRelationship, type Game } from "@playatlas/game-library/domain";
import { getFactories, getRepositories } from "../vitest.setup";

let repository: ReturnType<typeof getRepositories>;
let factory: ReturnType<typeof getFactories>;

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
  beforeEach(() => {
    repository = getRepositories();
    factory = getFactories();
  });

  it("persists games", () => {
    // Arrange
    const games = factory.getGame().buildGameList(100);
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
    assertRelationshipLoad(factory.getGame().buildGame(), "developers");
  });

  it("persists a game and eager load its publishers when requested", () => {
    assertRelationshipLoad(factory.getGame().buildGame(), "publishers");
  });

  it("persists a game and eager load its genres when requested", () => {
    assertRelationshipLoad(factory.getGame().buildGame(), "genres");
  });

  it("returns game manifest data", () => {
    // Arrange
    const games = factory.getGame().buildGameList(200);
    repository.game.upsertMany(games);
    // Act
    const manifestData = repository.game.getManifestData();
    const randomManifestGame = faker.helpers.arrayElement(manifestData);
    // Assert
    expect(manifestData.length).toBeGreaterThanOrEqual(games.length);
    expect(games.map((g) => g.getId())).toContain(randomManifestGame.Id);
  });
});
