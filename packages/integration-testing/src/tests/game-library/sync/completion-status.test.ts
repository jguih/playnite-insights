import { faker } from "@faker-js/faker";
import type { PlayAtlasApiV1 } from "@playatlas/bootstrap/application";
import type { PlayAtlasTestApiV1 } from "@playatlas/bootstrap/testing";
import { PlayniteCompletionStatusIdParser } from "@playatlas/common/domain";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeTestEnvironmentAsync, type TestEnvironment } from "../../../lib/environments";

describe("Game Library Synchronization / Completion Status", () => {
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

	it("Sync cursor invariant: correctly returns updated items across distinct timestamps", async () => {
		// Arrange
		testApi.getClock().setCurrent(new Date("2026-01-01T00:00:00Z"));

		const completionStatuses = testApi.factory.getCompletionStatusFactory().buildList(50);
		testApi.seed.seedCompletionStatus(completionStatuses);
		const firstQueryResult = api.gameLibrary.queries
			.getGetAllCompletionStatusesQueryHandler()
			.execute();

		testApi.getClock().advance(1000);

		const itemsToUpdate = faker.helpers.arrayElements(completionStatuses, 20);
		itemsToUpdate.forEach((i) =>
			i.updateFromPlaynite({
				name: `${i.getName()} (Updated)`,
				playniteId: PlayniteCompletionStatusIdParser.fromTrusted(`${i.getPlayniteId()}-(updated)`),
			}),
		);
		testApi.seed.seedCompletionStatus(itemsToUpdate);

		// Act
		const queryResult = api.gameLibrary.queries
			.getGetAllCompletionStatusesQueryHandler()
			.execute({ lastCursor: firstQueryResult.nextCursor });
		const queryCompletionStatuses = queryResult.data;

		// Assert
		expect(queryCompletionStatuses).toHaveLength(20);
		expect(queryCompletionStatuses.every((g) => g.Name?.match(/(updated)/i))).toBe(true);
	});
});
