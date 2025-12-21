import { faker } from "@faker-js/faker";
import { api, factory } from "../../vitest.global.setup";

let queryHandler = api.gameLibrary.queries.getGetAllGamesQueryHandler();

describe("Get All Games Query", () => {
  beforeEach(() => {
    queryHandler = api.gameLibrary.queries.getGetAllGamesQueryHandler();
  });

  it("returns empty games array", () => {
    // Act
    const result = queryHandler.execute();
    // Assert
    expect(result.type === "ok" && result.data.length === 0).toBeTruthy();
  });

  it("returns all games with large list", () => {
    // Arrange
    const listLength = 2000;
    const games = factory.getGameFactory().buildList(listLength);
    const gameIds = games.map((g) => g.getId());
    const oneGame = faker.helpers.arrayElement(games);
    api.gameLibrary.getGameRepository().upsert(games);
    // Act
    const result = queryHandler.execute();
    // Assert
    if (result.type !== "ok") throw new Error("Invalid result type");
    const oneResult = result.data.find((g) => g.Id === oneGame.getId());
    if (!oneResult) throw new Error("Could not find random game");

    expect(result.data).toHaveLength(listLength);
    expect(result.data.every((g) => gameIds.includes(g.Id))).toBeTruthy();
    expect(oneResult.Name).toBe(oneGame.getName());
    expect(oneResult.Description).toBe(oneGame.getDescription());
    expect(oneResult.ReleaseDate).toBe(
      oneGame.getReleaseDate()?.toISOString() ?? null
    );
    expect(oneResult.Playtime).toBe(oneGame.getPlaytime());
    expect(oneResult.LastActivity).toBe(
      oneGame.getLastActivity()?.toISOString() ?? null
    );
    expect(oneResult.Added).toBe(oneGame.getAdded()?.toISOString() ?? null);
    expect(oneResult.InstallDirectory).toBe(oneGame.getInstallDirectory());
    expect(oneResult.IsInstalled).toBe(+oneGame.isInstalled());
    expect(oneResult.BackgroundImage).toBe(oneGame.getBackgroundImage());
    expect(oneResult.CoverImage).toBe(oneGame.getCoverImage());
    expect(oneResult.Icon).toBe(oneGame.getIcon());
    expect(oneResult.Hidden).toBe(+oneGame.isHidden());
    expect(oneResult.CompletionStatusId).toBe(oneGame.getCompletionStatusId());
    expect(oneResult.ContentHash).toBe(oneGame.getContentHash());
    expect(new Set(oneResult.Developers)).toEqual(
      new Set(oneGame.relationships.developers.get())
    );
    expect(new Set(oneResult.Publishers)).toEqual(
      new Set(oneGame.relationships.publishers.get())
    );
    expect(new Set(oneResult.Genres)).toEqual(
      new Set(oneGame.relationships.genres.get())
    );
    expect(new Set(oneResult.Platforms)).toEqual(
      new Set(oneGame.relationships.platforms.get())
    );
    // Ensure no duplicate ids
    expect(oneResult.Developers).toEqual([...new Set(oneResult.Developers)]);
    expect(oneResult.Publishers).toEqual([...new Set(oneResult.Publishers)]);
    expect(oneResult.Genres).toEqual([...new Set(oneResult.Genres)]);
    expect(oneResult.Platforms).toEqual([...new Set(oneResult.Platforms)]);
  });

  it("returns empty array when no relationship", () => {
    // Arrange
    const game = factory.getGameFactory().build({
      genreIds: null,
      platformIds: null,
      developerIds: null,
      publisherIds: null,
    });
    api.gameLibrary.getGameRepository().upsert([game]);
    // Act
    const result = queryHandler.execute();
    // Assert
    if (result.type !== "ok") throw new Error("Invalid result type");
    const oneResult = result.data.find((g) => g.Id === game.getId());
    if (!oneResult) throw new Error("Could not find game from result");

    expect(oneResult.Developers).toHaveLength(0);
    expect(oneResult.Platforms).toHaveLength(0);
    expect(oneResult.Genres).toHaveLength(0);
    expect(oneResult.Publishers).toHaveLength(0);
  });

  it("shows null values as null and not empty string", () => {
    // Arrange
    const game = factory.getGameFactory().build({
      name: null,
      description: null,
      releaseDate: null,
      lastActivity: null,
      added: null,
      installDirectory: null,
      backgroundImage: null,
      coverImage: null,
      icon: null,
      completionStatusId: null,
    });
    api.gameLibrary.getGameRepository().upsert([game]);
    // Act
    const result = queryHandler.execute();
    // Assert
    if (result.type !== "ok") throw new Error("Invalid result type");
    const oneResult = result.data.find((g) => g.Id === game.getId());
    if (!oneResult) throw new Error("Could not find game from result");

    expect(oneResult.Name).toBeNull();
    expect(oneResult.Description).toBeNull();
    expect(oneResult.ReleaseDate).toBeNull();
    expect(oneResult.LastActivity).toBeNull();
    expect(oneResult.Added).toBeNull();
    expect(oneResult.InstallDirectory).toBeNull();
    expect(oneResult.BackgroundImage).toBeNull();
    expect(oneResult.CoverImage).toBeNull();
    expect(oneResult.Icon).toBeNull();
    expect(oneResult.CompletionStatusId).toBeNull();
  });

  it("returns 'not_modified' when provided a valid etag", () => {
    // Arrange
    const games = factory.getGameFactory().buildList(200);
    api.gameLibrary.getGameRepository().upsert(games);
    // Act
    const result = queryHandler.execute();
    if (result.type !== "ok") throw new Error("Invalid result type");
    const afterResult = queryHandler.execute({ ifNoneMatch: result.etag });
    // Assert
    expect(afterResult.type === "not_modified").toBeTruthy();
  });
});
