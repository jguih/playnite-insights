import { faker } from "@faker-js/faker";
import type { PlayAtlasApiV1 } from "@playatlas/bootstrap/application";
import type { PlayAtlasTestApiV1 } from "@playatlas/bootstrap/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeTestEnvironmentAsync, type TestEnvironment } from "../../../lib/environments";
import { isCursorAfter } from "../../../test.lib";

describe("Game Library Synchronization / Game", () => {
	let env: TestEnvironment;
	let api: PlayAtlasApiV1;
	let testApi: PlayAtlasTestApiV1;

	beforeEach(async () => {
		env = await makeTestEnvironmentAsync();
		({ api, testApi } = env);
		testApi.seed.seedGameRelationships(testApi.data.getGameRelationshipOptions());
	});

	afterEach(async () => {
		await env.disposeAsync();
	});

	it("Sync cursor invariant: correctly returns updated items across distinct timestamps", async () => {
		// Arrange
		testApi.getClock().setCurrent(new Date("2026-01-01T00:00:00Z"));

		const games = testApi.factory.getGameFactory().buildList(20);
		testApi.seed.seedGame(games);

		const firstQueryResult = api.gameLibrary.queries.getGetAllGamesQueryHandler().execute();
		const firstQueryIds = new Set(firstQueryResult.data.map((g) => g.Id));

		testApi.getClock().advance(1000);

		const gamesToUpdate = faker.helpers.arrayElements(games, 10);

		for (const game of gamesToUpdate) {
			const snapshot = testApi.factory.getGameFactory().buildPlayniteSnapshot();
			game.updateFromPlaynite({
				contentHash: `${faker.string.uuid()} (Updated)`,
				playniteSnapshot: {
					...snapshot,
					name: `${snapshot.name} (Updated)`,
				},
				relationships: {
					developerIds: [],
					genreIds: [],
					platformIds: [],
					publisherIds: [],
					tagIds: [],
				},
			});
		}

		testApi.seed.seedGame(gamesToUpdate);

		// Act
		const secondQueryResult = api.gameLibrary.queries
			.getGetAllGamesQueryHandler()
			.execute({ lastCursor: firstQueryResult.nextCursor });
		const secondGames = secondQueryResult.data;

		// Assert
		expect(
			isCursorAfter(secondQueryResult.nextCursor, firstQueryResult.nextCursor),
			"Sync cursor must be strictly monotonic; Changes to repository's 'ORDER BY' clause may break incremental sync. All items must be ordered by LastUpdatedAt ASC, then Id ASC.",
		).toBe(true);

		expect(secondGames).toHaveLength(10);
		expect(
			secondGames.every((g) => firstQueryIds.has(g.Id)),
			"Query must return updated versions of previously-synced items",
		).toBe(true);
		expect(secondGames.every((g) => g.Playnite!.Name?.match(/(updated)/i))).toBe(true);
		expect(secondGames.every((g) => g.ContentHash?.match(/updated/i))).toBe(true);
	});
});
