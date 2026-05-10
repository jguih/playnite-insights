import { faker } from "@faker-js/faker";
import type { PlayAtlasApiV1 } from "@playatlas/bootstrap/application";
import type { PlayAtlasTestApiV1 } from "@playatlas/bootstrap/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeTestEnvironmentAsync, type TestEnvironment } from "../../../lib/environments";
import { isCursorAfter } from "../../../test.lib";

describe("Game Library Synchronization / Platform", () => {
	let env: TestEnvironment;
	let api: PlayAtlasApiV1;
	let testApi: PlayAtlasTestApiV1;

	beforeEach(async () => {
		env = await makeTestEnvironmentAsync();
		({ api, testApi } = env);
	});

	afterEach(async () => {
		await env.disposeAsync();
	});

	it("Sync cursor invariant: correctly returns updated items across distinct timestamps", () => {
		// Arrange
		testApi.getClock().setCurrent(new Date("2026-01-01T00:00:00Z"));
		const platforms = testApi.factory.getPlatformFactory().buildList(500);
		testApi.seed.seedPlatform(platforms);

		// Act
		const firstResult = api.gameLibrary.queries.getGetAllPlatformsQueryHandler().execute();
		const firstData = firstResult.data;
		const firstIds = new Set(firstData.map((g) => g.Id));

		testApi.getClock().advance(1000);
		const newPlatforms = testApi.factory
			.getPlatformFactory()
			.buildList(500, { name: `${faker.lorem.words({ min: 1, max: 3 })} (New)` });
		testApi.seed.seedPlatform(newPlatforms);

		const secondResult = api.gameLibrary.queries
			.getGetAllPlatformsQueryHandler()
			.execute({ lastCursor: firstResult.nextCursor });
		const secondData = secondResult.data;

		// Assert
		expect(
			isCursorAfter(secondResult.nextCursor, firstResult.nextCursor),
			"Sync cursor must be strictly monotonic; Changes to repository's 'ORDER BY' clause may break incremental sync. All items must be ordered by LastUpdatedAt ASC, then Id ASC.",
		).toBe(true);
		expect(
			secondData.every((g) => !firstIds.has(g.Id)),
			"Query must return updated versions of previously-synced items",
		).toBe(true);

		expect(firstData).toHaveLength(500);

		expect(secondData).toHaveLength(500);
		expect(secondData.every((g) => g.Name.match(/(new)/i))).toBe(true);
	});
});
