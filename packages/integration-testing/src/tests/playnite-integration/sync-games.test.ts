import { faker } from "@faker-js/faker";
import type { PlayAtlasApiV1 } from "@playatlas/bootstrap/application";
import type { PlayAtlasTestApiV1 } from "@playatlas/bootstrap/testing";
import type { DomainEvent } from "@playatlas/common/application";
import {
	makeSyncGamesCommand,
	type SyncGamesRequestDto,
} from "@playatlas/playnite-integration/commands";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeTestEnvironmentAsync, type TestEnvironment } from "../../lib/environments";
import { recordDomainEvents } from "../../test.lib";

describe("Game Library Sync", { timeout: 20_000 }, () => {
	let unsubscribe: () => void;
	let events: DomainEvent[];
	let env: TestEnvironment;
	let api: PlayAtlasApiV1;
	let testApi: PlayAtlasTestApiV1;

	beforeEach(async () => {
		env = await makeTestEnvironmentAsync();
		({ api, testApi } = env);
		testApi.seed.seedDefaultClassifications();
		({ events, unsubscribe } = recordDomainEvents(env.api));
	});

	afterEach(async () => {
		unsubscribe();
		await env.disposeAsync();
	});

	it("adds games", async () => {
		// Arrange
		const sampleSize = 5000;
		const addedItems = testApi.factory.getSyncGameRequestDtoFactory().buildList(sampleSize);

		const requestDto: SyncGamesRequestDto = {
			AddedItems: addedItems,
			RemovedItems: [],
			UpdatedItems: [],
		};

		const command = makeSyncGamesCommand(requestDto);

		// Act
		const commandResult = await api.playniteIntegration.commands
			.getSyncGamesCommandHandler()
			.executeAsync(command);
		const queryResult = api.gameLibrary.queries.getGetAllGamesQueryHandler().execute();
		const games = queryResult.data;

		// Assert
		expect(commandResult.success).toBe(true);
		expect(commandResult.reason_code).toBe("game_library_synchronized");

		expect(new Set(games.map((g) => g.Id)).size).toBe(sampleSize);

		expect(events).toHaveLength(1);

		const event = events.at(0);
		const syncEvent = event && event.name === "game-library-synchronized" ? event : null;

		expect(syncEvent).not.toBeNull();
		expect(syncEvent!.payload.added).toHaveLength(sampleSize);
		expect(syncEvent!.payload.deleted).toHaveLength(0);
		expect(syncEvent!.payload.updated).toHaveLength(0);
	});

	it("removes games", async () => {
		// Arrange
		const initialItems = testApi.factory.getSyncGameRequestDtoFactory().buildList(2000);
		const removedItems = faker.helpers.arrayElements(initialItems, 500);

		const seedCommand = makeSyncGamesCommand({
			AddedItems: initialItems,
			RemovedItems: [],
			UpdatedItems: [],
		});

		await api.playniteIntegration.commands.getSyncGamesCommandHandler().executeAsync(seedCommand);

		events.length = 0;

		const removeCommand = makeSyncGamesCommand({
			AddedItems: [],
			RemovedItems: removedItems.map((i) => i.Id),
			UpdatedItems: [],
		});

		// Act
		const commandResult = await api.playniteIntegration.commands
			.getSyncGamesCommandHandler()
			.executeAsync(removeCommand);
		const queryResult = api.gameLibrary.queries.getGetAllGamesQueryHandler().execute();
		const games = queryResult.data;
		const visibleGames = games.filter((g) => g.Sync.DeletedAt === null);
		const deletedGames = games.filter((g) => g.Sync.DeletedAt !== null);

		// Assert
		expect(commandResult.success).toBe(true);
		expect(commandResult.reason_code).toBe("game_library_synchronized");

		expect(visibleGames).toHaveLength(1500);
		expect(deletedGames).toHaveLength(500);

		expect(events).toHaveLength(1);

		const event = events.at(0);
		const syncEvent = event && event.name === "game-library-synchronized" ? event : null;

		expect(syncEvent).not.toBeNull();
		expect(syncEvent!.payload.added).toHaveLength(0);
		expect(syncEvent!.payload.updated).toHaveLength(0);
		expect(syncEvent!.payload.deleted).toHaveLength(500);
	});

	it("updates games", async () => {
		// Arrange
		const genreOptions = faker.helpers.arrayElements(
			testApi.factory.getSyncGameRequestDtoFactory().genreOptions,
			{ min: 3, max: 3 },
		);
		const initialSyncItems = testApi.factory.getSyncGameRequestDtoFactory().buildList(2000);
		const itemsToUpdate = faker.helpers.arrayElements(initialSyncItems, 500);

		const updatedItems = itemsToUpdate.map((game) => ({
			...game,
			Name: `${game.Name} (Updated)`,
			Description: faker.lorem.paragraph(),
			Genres: genreOptions,
			ContentHash: `${faker.string.uuid()}-(updated)`,
		}));

		const seedCommand = makeSyncGamesCommand({
			AddedItems: initialSyncItems,
			RemovedItems: [],
			UpdatedItems: [],
		});

		await api.playniteIntegration.commands.getSyncGamesCommandHandler().executeAsync(seedCommand);

		events.length = 0;

		const updateCommand = makeSyncGamesCommand({
			AddedItems: [],
			RemovedItems: [],
			UpdatedItems: updatedItems,
		});

		// Act
		const commandResult = await api.playniteIntegration.commands
			.getSyncGamesCommandHandler()
			.executeAsync(updateCommand);

		const queryResult = api.gameLibrary.queries.getGetAllGamesQueryHandler().execute();
		const games = queryResult.data;
		const updatedGames = games.filter((g) => g.Playnite?.Name?.match(/(updated)/i));

		// Assert
		expect(commandResult.success).toBe(true);
		expect(commandResult.reason_code).toBe("game_library_synchronized");

		expect(updatedGames).toHaveLength(500);
		expect(updatedGames.every((g) => g.ContentHash.match(/(updated)/i))).toBe(true);

		expect(games).toHaveLength(2000);
		expect(new Set(games.map((g) => g.Playnite?.Id))).toEqual(
			new Set(initialSyncItems.map((g) => g.Id)),
		);

		expect(events).toHaveLength(1);

		const event = events.at(0);
		const syncEvent = event && event.name === "game-library-synchronized" ? event : null;

		expect(syncEvent).not.toBeNull();
		expect(syncEvent?.payload.updated).toHaveLength(500);
		expect(syncEvent!.payload.added).toHaveLength(0);
		expect(syncEvent!.payload.deleted).toHaveLength(0);
	});
});
