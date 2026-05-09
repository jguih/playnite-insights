import { DEFAULT_CLASSIFICATIONS } from "@playatlas/game-library/commands";
import type { MakeClassificationProps } from "@playatlas/game-library/domain";
import { describe, expect, it } from "vitest";
import { isCursorAfter, isCursorEqual } from "../../../test.lib";
import { api, testApi } from "../../../vitest.global.setup";

describe("Game Library Synchronization / Classifications", () => {
	it("Sync cursor invariant: correctly returns updated items across distinct timestamps", async () => {
		// Arrange
		testApi.getClock().setCurrent(new Date("2026-01-01T00:00:00Z"));

		const v1 = "v1.0.0";
		const v2 = "v2.0.0";

		const handler = testApi.gameLibrary.commands.getApplyDefaultClassificationsCommandHandler();

		const classificationsV1: MakeClassificationProps[] = [...DEFAULT_CLASSIFICATIONS].map((c) => ({
			...c,
			version: v1,
		}));

		handler.execute({
			type: "override",
			buildDefaultClassificationsOverride: ({ classificationFactory: f }) => {
				return classificationsV1.map((c) => f.create({ ...c }));
			},
		});
		const firstQueryResult = api.gameLibrary.scoreEngine.queries
			.getGetAllClassificationsQueryHandler()
			.execute();
		const firstIds = firstQueryResult.data.map((c) => c.Id);

		testApi.getClock().advance(1000);

		const classificationsV2: MakeClassificationProps[] = [...DEFAULT_CLASSIFICATIONS].map((c) => ({
			...c,
			version: v2,
		}));
		handler.execute({
			type: "override",
			buildDefaultClassificationsOverride: ({ classificationFactory: f }) => {
				return classificationsV2.map((c) => f.create({ ...c }));
			},
		});

		// Act
		const secondQueryResult = api.gameLibrary.scoreEngine.queries
			.getGetAllClassificationsQueryHandler()
			.execute();

		// Assert
		expect(
			isCursorAfter(secondQueryResult.nextCursor, firstQueryResult.nextCursor),
			"Sync cursor must be strictly monotonic; Changes to repository's 'ORDER BY' clause may break incremental sync. All items must be ordered by LastUpdatedAt ASC, then Id ASC.",
		).toBe(true);
		expect(
			secondQueryResult.data.every((c) => firstIds.includes(c.Id)),
			"Query must return updated versions of previously-synced items",
		).toBe(true);

		expect(secondQueryResult.data).toHaveLength(classificationsV2.length);
		expect(secondQueryResult.data.every((c) => c.Version === v2)).toBe(true);
	});

	it("Sync cursor invariant: query returns an empty list when no data have changed", () => {
		// Arrange
		testApi.gameLibrary.commands.getApplyDefaultClassificationsCommandHandler().execute({
			type: "default",
		});
		const firstQueryResult = api.gameLibrary.scoreEngine.queries
			.getGetAllClassificationsQueryHandler()
			.execute();

		// Act
		const secondQueryResult = api.gameLibrary.scoreEngine.queries
			.getGetAllClassificationsQueryHandler()
			.execute({ lastCursor: firstQueryResult.nextCursor });

		// Assert
		expect(
			isCursorEqual(secondQueryResult.nextCursor, firstQueryResult.nextCursor),
			"Sync cursor must be strictly monotonic; Changes to repository's 'ORDER BY' clause may break incremental sync. All items must be ordered by LastUpdatedAt ASC, then Id ASC.",
		).toBe(true);

		expect(
			secondQueryResult.data,
			"Query must return an empty list if no items changed after last cursor",
		).toHaveLength(0);
	});

	it("orders classifications deterministically when timestamps are equal (Id tie-breaker)", () => {
		// Arrange
		const fixedTime = new Date("2026-01-01T00:00:00Z");
		testApi.getClock().setCurrent(fixedTime);

		const handler = testApi.gameLibrary.commands.getApplyDefaultClassificationsCommandHandler();

		// Intentionally unsorted IDs
		const unordered: MakeClassificationProps[] = [
			{ ...DEFAULT_CLASSIFICATIONS[0], id: "RUN-BASED", version: "v1.0.0" },
			{ ...DEFAULT_CLASSIFICATIONS[0], id: "HORROR", version: "v1.0.0" },
			{ ...DEFAULT_CLASSIFICATIONS[0], id: "SURVIVAL", version: "v1.0.0" },
		];

		handler.execute({
			type: "override",
			buildDefaultClassificationsOverride: ({ classificationFactory: f }) => {
				return unordered.map((c) =>
					f.create({
						...c,
					}),
				);
			},
		});

		// Act
		const result = api.gameLibrary.scoreEngine.queries
			.getGetAllClassificationsQueryHandler()
			.execute();
		const returnedIds = result.data.map((c) => c.Id);

		// Assert
		const expectedIds = [...returnedIds].sort();

		expect(
			returnedIds,
			"Items with identical timestamps must be ordered by Id ASC. Changes to repository ORDER BY may break sync determinism.",
		).toEqual(expectedIds);
	});
});
