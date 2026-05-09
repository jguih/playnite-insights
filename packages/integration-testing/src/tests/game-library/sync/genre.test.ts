import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";
import { isCursorAfter } from "../../../test.lib";
import { api, testApi } from "../../../vitest.global.setup";

describe("Game Library Synchronization / Genre", () => {
	it("Sync cursor invariant: correctly returns updated items across distinct timestamps", () => {
		// Arrange
		testApi.getClock().setCurrent(new Date("2026-01-01T00:00:00Z"));
		const genres = testApi.factory.getGenreFactory().buildList(500);
		testApi.seed.seedGenre(genres);

		// Act
		const firstResult = api.gameLibrary.queries.getGetAllGenresQueryHandler().execute();
		const firstData = firstResult.data;
		const firstIds = new Set(firstData.map((g) => g.Id));

		testApi.getClock().advance(1000);
		const newGenres = testApi.factory
			.getGenreFactory()
			.buildList(500, { name: `${faker.book.genre()} (New)` });
		testApi.seed.seedGenre(newGenres);

		const secondResult = api.gameLibrary.queries
			.getGetAllGenresQueryHandler()
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
