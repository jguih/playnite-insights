import { faker } from "@faker-js/faker";
import { GameRelationship, type Game } from "@playatlas/game-library/domain";
import { GameRepository } from "@playatlas/game-library/infra";
import { api, factory } from "../vitest.setup";

let repository: GameRepository = api.gameLibrary.getGameRepository();

const assertRelationshipLoad = (
  game: Game,
  relationshipKey: GameRelationship
) => {
  repository.upsert([game]);

  const loaded = repository.getById(game.getId(), {
    load: { [relationshipKey]: true },
  });
  const originalIds = game.relationships[relationshipKey].isLoaded()
    ? game.relationships[relationshipKey].get()
    : [];
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
    repository = api.gameLibrary.getGameRepository();
  });

  it("persists games", () => {
    // Arrange
    const games = factory.getGameFactory().buildList(100);
    const randomGame = faker.helpers.arrayElement(games);
    // Act
    repository.upsert(games);
    const added = repository.all();
    const addedRandomGame = repository.getById(randomGame.getId());
    // Assert
    expect(added).toHaveLength(games.length);
    expect(addedRandomGame?.getId()).toBe(randomGame.getId());
    expect(addedRandomGame?.getName()).toBe(randomGame.getName());
    expect(addedRandomGame?.getCompletionStatusId()).toBe(
      randomGame.getCompletionStatusId()
    );
  });

  it("persists a game and eager load its developers when requested", () => {
    assertRelationshipLoad(factory.getGameFactory().build(), "developers");
  });

  it("persists a game and eager load its publishers when requested", () => {
    assertRelationshipLoad(factory.getGameFactory().build(), "publishers");
  });

  it("persists a game and eager load its genres when requested", () => {
    assertRelationshipLoad(factory.getGameFactory().build(), "genres");
  });

  it("persists a game and eager load its platforms when requested", () => {
    assertRelationshipLoad(factory.getGameFactory().build(), "platforms");
  });

  it("returns game manifest data", () => {
    // Arrange
    const games = factory.getGameFactory().buildList(200);
    repository.upsert(games);
    // Act
    const manifestData = repository.getManifestData();
    const randomManifestGame = faker.helpers.arrayElement(manifestData);
    // Assert
    expect(manifestData.length).toBeGreaterThanOrEqual(games.length);
    expect(games.map((g) => g.getId())).toContain(randomManifestGame.Id);
  });

  it("returns all games with loaded relationships", () => {
    // Arrange
    const games = factory.getGameFactory().buildList(200);
    repository.upsert(games);
    // Act
    const allGames = repository.all({ load: true });
    // Assert
    expect(allGames.length).toBeGreaterThanOrEqual(games.length);
    for (const r of Object.keys(games[0].relationships) as GameRelationship[]) {
      expect(allGames.every((g) => g.relationships[r].isLoaded())).toBeTruthy();
    }
  });
});
