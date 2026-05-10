import { faker } from "@faker-js/faker";
import type { PlayAtlasApiV1 } from "@playatlas/bootstrap/application";
import type { PlayAtlasTestApiV1 } from "@playatlas/bootstrap/testing";
import { GameIdParser, PlayniteGameIdParser } from "@playatlas/common/domain";
import { makeSyncGamesCommand } from "@playatlas/playnite-integration/commands";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeTestEnvironmentAsync, type TestEnvironment } from "../../lib/environments";

describe("Game Library / Game", { timeout: 20_000 }, () => {
	let env: TestEnvironment;
	let api: PlayAtlasApiV1;
	let testApi: PlayAtlasTestApiV1;

	beforeEach(async () => {
		env = await makeTestEnvironmentAsync();
		({ api, testApi } = env);
		testApi.seed.seedGameRelationships(testApi.data.getGameRelationshipOptions());
		testApi.seed.seedDefaultClassifications();
	});

	afterEach(async () => {
		await env.disposeAsync();
	});

	it("persists games", () => {
		// Arrange
		const games = testApi.factory.getGameFactory().buildList(10);
		const randomGame = faker.helpers.arrayElement(games);

		// Act
		testApi.seed.seedGame(games);
		const queryResult = api.gameLibrary.queries.getGetAllGamesQueryHandler().execute();
		const added = queryResult.data;
		const addedRandomGame = added.find((g) => g.Id === randomGame.getId());

		// Assert
		expect(added).toHaveLength(games.length);
		expect(addedRandomGame).toBeDefined();
		expect(addedRandomGame!.Playnite?.Name).toBe(randomGame.getPlayniteSnapshot()?.name);
		expect(addedRandomGame!.CompletionStatusId).toBe(randomGame.getCompletionStatusId());
	});

	it("persists a game and eager load its developers", () => {
		// Arrange
		const dev = testApi.factory.getCompanyFactory().build();
		const devId = dev.getId();
		testApi.seed.seedCompany(dev);

		const game = testApi.factory.getGameFactory().build({ developerIds: [devId] });
		testApi.seed.seedGame(game);

		// Act
		const result = api.gameLibrary.queries.getGetAllGamesQueryHandler().execute();
		const games = result.data;
		const insertedGame = games?.find((g) => g.Id === game.getId());

		// Assert
		expect(games).toBeTruthy();
		expect(insertedGame).toBeDefined();
		expect(new Set(insertedGame?.Developers)).toEqual(new Set([devId]));
	});

	it("persists a game and eager load its publishers", () => {
		// Arrange
		const publisher = testApi.factory.getCompanyFactory().build();
		const publisherId = publisher.getId();
		testApi.seed.seedCompany(publisher);

		const game = testApi.factory.getGameFactory().build({ publisherIds: [publisherId] });
		testApi.seed.seedGame(game);

		// Act
		const result = api.gameLibrary.queries.getGetAllGamesQueryHandler().execute();
		const games = result.data;
		const insertedGame = games?.find((g) => g.Id === game.getId());

		// Assert
		expect(games).toBeTruthy();
		expect(insertedGame).toBeTruthy();
		expect(new Set(insertedGame?.Publishers)).toEqual(new Set([publisherId]));
	});

	it("persists a game and eager load its genres", () => {
		// Arrange
		const genre = testApi.factory.getGenreFactory().build();
		const genreId = genre.getId();
		testApi.seed.seedGenre(genre);

		const game = testApi.factory.getGameFactory().build({ genreIds: [genreId] });
		testApi.seed.seedGame(game);

		// Act
		const result = api.gameLibrary.queries.getGetAllGamesQueryHandler().execute();
		const games = result.data;
		const insertedGame = games?.find((g) => g.Id === game.getId());

		// Assert
		expect(games).toBeTruthy();
		expect(insertedGame).toBeTruthy();
		expect(new Set(insertedGame?.Genres)).toEqual(new Set([genreId]));
	});

	it("persists a game and eager load its platforms", () => {
		// Arrange
		const platform = testApi.factory.getPlatformFactory().build();
		const platformId = platform.getId();
		testApi.seed.seedPlatform(platform);

		const game = testApi.factory.getGameFactory().build({ platformIds: [platformId] });
		testApi.seed.seedGame(game);

		// Act
		const result = api.gameLibrary.queries.getGetAllGamesQueryHandler().execute();
		const games = result.data;
		const insertedGame = games?.find((g) => g.Id === game.getId());

		// Assert
		expect(games).toBeTruthy();
		expect(insertedGame).toBeTruthy();
		expect(new Set(insertedGame?.Platforms)).toEqual(new Set([platformId]));
	});

	it("persists a game and eager load its tags", () => {
		// Arrange
		const tag = testApi.factory.getTagFactory().build();
		const tagId = tag.getId();
		testApi.seed.seedTags(tag);

		const game = testApi.factory.getGameFactory().build({ tagIds: [tagId] });
		testApi.seed.seedGame(game);

		// Act
		const result = api.gameLibrary.queries.getGetAllGamesQueryHandler().execute();
		const games = result.data;
		const insertedGame = games?.find((g) => g.Id === game.getId());

		// Assert
		expect(games).toBeTruthy();
		expect(insertedGame).toBeTruthy();
		expect(new Set(insertedGame?.Tags)).toEqual(new Set([tagId]));
	});

	it("returns game manifest data", async () => {
		// Arrange
		const game = testApi.factory.getGameFactory().build();
		const gameId = game.getPlayniteSnapshot()?.id;
		testApi.seed.seedGame(game);

		// Act
		await api.playniteIntegration.getLibraryManifestService().write();
		const manifest = await api.playniteIntegration.getLibraryManifestService().get();

		// Assert
		expect(manifest).toBeTruthy();
		expect(manifest?.gamesInLibrary.map((g) => g.gameId)).toContain(gameId);
	});

	it("returns empty games array", () => {
		// Act
		const result = api.gameLibrary.queries.getGetAllGamesQueryHandler().execute();
		const games = result.data;

		// Assert
		expect(games).toHaveLength(0);
	});

	it("returns all games with large list", () => {
		// Arrange
		const listLength = 10000;
		const games = testApi.factory.getGameFactory().buildList(listLength);
		const gameIds = games.map((g) => g.getId());
		const oneGame = faker.helpers.arrayElement(games);
		const oneGamePlayniteSnapshot = oneGame.getPlayniteSnapshot();
		testApi.seed.seedGame(games);

		// Act
		const queryResult = api.gameLibrary.queries.getGetAllGamesQueryHandler().execute();
		const queryGames = queryResult.data;
		const oneResult = queryGames.find((g) => g.Id === oneGame.getId());

		// Assert
		expect(queryGames).toHaveLength(listLength);
		expect(queryGames.every((g) => gameIds.includes(GameIdParser.fromExternal(g.Id)))).toBeTruthy();

		expect(oneResult).toBeDefined();
		expect(oneResult?.Playnite).toBeDefined();
		expect(oneResult!.Playnite!.Name).toBe(oneGamePlayniteSnapshot?.name);
		expect(oneResult!.Playnite!.Description).toBe(oneGamePlayniteSnapshot?.description);
		expect(oneResult!.Playnite!.ReleaseDate).toBe(
			oneGamePlayniteSnapshot?.releaseDate?.toISOString() ?? null,
		);
		expect(oneResult!.Playnite!.Playtime).toBe(oneGamePlayniteSnapshot!.playtime);
		expect(oneResult!.Playnite?.LastActivity).toBe(
			oneGamePlayniteSnapshot?.lastActivity?.toISOString() ?? null,
		);
		expect(oneResult!.Playnite!.Added).toBe(oneGamePlayniteSnapshot?.added?.toISOString() ?? null);
		expect(oneResult!.Playnite!.InstallDirectory).toBe(oneGamePlayniteSnapshot?.installDirectory);
		expect(oneResult!.Playnite!.IsInstalled).toBe(oneGamePlayniteSnapshot?.isInstalled);
		expect(oneResult!.Playnite!.BackgroundImagePath).toBe(oneGame.getBackgroundImagePath());
		expect(oneResult!.Playnite!.CoverImagePath).toBe(oneGame.getCoverImagePath());
		expect(oneResult!.Playnite!.IconImagePath).toBe(oneGame.getIconImagePath());
		expect(oneResult!.Playnite!.Hidden).toBe(oneGamePlayniteSnapshot?.hidden);
		expect(oneResult!.CompletionStatusId).toBe(oneGame.getCompletionStatusId());
		expect(oneResult!.ContentHash).toBe(oneGame.getContentHash());
		expect(new Set(oneResult!.Developers)).toEqual(new Set(oneGame.relationships.developers.get()));
		expect(new Set(oneResult!.Publishers)).toEqual(new Set(oneGame.relationships.publishers.get()));
		expect(new Set(oneResult!.Genres)).toEqual(new Set(oneGame.relationships.genres.get()));
		expect(new Set(oneResult!.Platforms)).toEqual(new Set(oneGame.relationships.platforms.get()));
		// Ensure no duplicate ids
		expect(oneResult!.Developers).toEqual([...new Set(oneResult!.Developers)]);
		expect(oneResult!.Publishers).toEqual([...new Set(oneResult!.Publishers)]);
		expect(oneResult!.Genres).toEqual([...new Set(oneResult!.Genres)]);
		expect(oneResult!.Platforms).toEqual([...new Set(oneResult!.Platforms)]);
	});

	it("returns empty array when no relationship", () => {
		// Arrange
		const game = testApi.factory.getGameFactory().build({
			genreIds: null,
			platformIds: null,
			developerIds: null,
			publisherIds: null,
		});
		testApi.seed.seedGame([game]);

		// Act
		const result = api.gameLibrary.queries.getGetAllGamesQueryHandler().execute();
		const games = result.data;
		const oneResult = games.find((g) => g.Id === game.getId());

		// Assert
		expect(oneResult).toBeDefined();
		expect(oneResult!.Developers).toHaveLength(0);
		expect(oneResult!.Platforms).toHaveLength(0);
		expect(oneResult!.Genres).toHaveLength(0);
		expect(oneResult!.Publishers).toHaveLength(0);
	});

	it("shows null values as null and not empty string", () => {
		// Arrange
		const game = testApi.factory.getGameFactory().build({
			playniteSnapshot: {
				name: null,
				description: null,
				releaseDate: null,
				lastActivity: null,
				added: null,
				installDirectory: null,
				backgroundImagePath: null,
				coverImagePath: null,
				iconImagePath: null,
				hidden: false,
				id: PlayniteGameIdParser.fromTrusted(faker.string.uuid()),
				isInstalled: false,
				playtime: 0,
				completionStatusId: null,
			},
		});
		testApi.seed.seedGame([game]);

		// Act
		const result = api.gameLibrary.queries.getGetAllGamesQueryHandler().execute();
		const games = result.data;
		const oneResult = games.find((g) => g.Id === game.getId());

		// Assert
		expect(oneResult).toBeDefined();
		expect(oneResult?.Playnite).toBeDefined();
		expect(oneResult!.Playnite!.Name).toBeNull();
		expect(oneResult!.Playnite!.Description).toBeNull();
		expect(oneResult!.Playnite!.ReleaseDate).toBeNull();
		expect(oneResult!.Playnite!.LastActivity).toBeNull();
		expect(oneResult!.Playnite!.Added).toBeNull();
		expect(oneResult!.Playnite!.InstallDirectory).toBeNull();
	});

	it("deletion don't actually delete games, but mark them as deleted", async () => {
		// Arrange
		testApi.getClock().setCurrent(new Date("2026-01-01T00:00:00Z"));

		const syncItems = testApi.factory.getSyncGameRequestDtoFactory().buildList(200);

		const seedCommand = makeSyncGamesCommand({
			AddedItems: syncItems,
			RemovedItems: [],
			UpdatedItems: [],
		});

		const seedResult = await api.playniteIntegration.commands
			.getSyncGamesCommandHandler()
			.executeAsync(seedCommand);
		expect(seedResult.success).toBe(true);

		testApi.getClock().advance(1000);
		const deletedAtTime = testApi.getClock().now();

		const itemsToDelete = faker.helpers.arrayElements(syncItems, 20);
		const deleteCommand = makeSyncGamesCommand({
			AddedItems: [],
			RemovedItems: itemsToDelete.map((i) => i.Id),
			UpdatedItems: [],
		});

		const deleteResult = await api.playniteIntegration.commands
			.getSyncGamesCommandHandler()
			.executeAsync(deleteCommand);
		expect(deleteResult.success).toBe(true);

		// Act
		const queryResult = api.gameLibrary.queries.getGetAllGamesQueryHandler().execute();
		const games = queryResult.data;
		const deletedGames = games.filter((g) => g.Sync.DeletedAt !== null);

		// Assert
		expect(games).toHaveLength(200);
		expect(deletedGames).toHaveLength(20);
		expect(
			deletedGames.every((g) => new Date(g.Sync.DeletedAt!).getTime() >= deletedAtTime.getTime()),
		).toBe(true);

		const uniqueDeletedAt = new Set(deletedGames.map((g) => g.Sync.DeletedAt));
		expect(uniqueDeletedAt.size).toBe(1);
	});
});
