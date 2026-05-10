import type { PlayAtlasApiV1 } from "@playatlas/bootstrap/application";
import type { PlayAtlasTestApiV1 } from "@playatlas/bootstrap/testing";
import type { PlatformResponseDto } from "@playatlas/game-library/dtos";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeTestEnvironmentAsync, type TestEnvironment } from "../../lib/environments";

describe("Game Library / Platform", () => {
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

	it("persists a new platform", () => {
		// Arrange
		const platformName = "test-platform#12" as const;
		const platform = testApi.factory.getPlatformFactory().build({ name: platformName });
		testApi.seed.seedPlatform(platform);

		// Act
		const result = api.gameLibrary.queries.getGetAllPlatformsQueryHandler().execute();
		const platforms = result.data;
		const addedPlatform = platforms.find((p) => p.Name === platformName);

		// Assert
		expect(addedPlatform).toBeDefined();
		expect(addedPlatform).toMatchObject({
			Name: platformName,
		} satisfies Partial<PlatformResponseDto>);
	});

	it("handles a big list of platforms", () => {
		// Arrange
		const newPlatformsCount = 3000;
		const newPlatforms = testApi.factory.getPlatformFactory().buildList(newPlatformsCount);
		testApi.seed.seedPlatform(newPlatforms);

		// Act
		const result = api.gameLibrary.queries.getGetAllPlatformsQueryHandler().execute();
		const platforms = result.data;

		// Assert
		expect(platforms.length).toBeGreaterThanOrEqual(newPlatformsCount);
	});
});
