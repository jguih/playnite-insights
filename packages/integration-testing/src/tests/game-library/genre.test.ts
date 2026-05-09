import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";
import { isCursorAfter } from "../../test.lib";
import { api, testApi } from "../../vitest.global.setup";

describe("Game Library / Genre", () => {
	it("persists a new genre", () => {
		// Arrange
		const genre = testApi.factory.getGenreFactory().build();
		testApi.seed.seedGenre(genre);

		// Act
		const result = api.gameLibrary.queries.getGetAllGenresQueryHandler().execute();
		const genres = result.data;
		const addedGenre = genres.find((g) => g.Id === genre.getId());

		// Assert
		expect(addedGenre).toBeTruthy();
		expect(addedGenre).toMatchObject({
			Id: genre.getId(),
			Name: genre.getName(),
		});
	});

	it("returns a big list of genres", () => {
		// Arrange
		const newGenresCount = 3000;
		const newGenres = testApi.factory.getGenreFactory().buildList(newGenresCount);
		testApi.seed.seedGenre(newGenres);

		// Act
		const result = api.gameLibrary.queries.getGetAllGenresQueryHandler().execute();
		const genres = result.data;

		// Assert
		expect(genres.length).toBeGreaterThanOrEqual(newGenresCount);
	});

	it("ENFORCES sync cursor invariant: ORDER BY LastUpdatedAt ASC, Id ASC", () => {
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
			"Sync cursor must be strictly monotonic; ORDER BY change will break incremental sync",
		).toBe(true);
		expect(
			secondData.every((g) => !firstIds.has(g.Id)),
			"Item order for synchronization violated: all items must be ordered by LastUpdatedAt ASC, then Id ASC",
		).toBe(true);

		expect(firstData).toHaveLength(500);

		expect(secondData).toHaveLength(500);
		expect(secondData.every((g) => g.Name.match(/(new)/i))).toBe(true);
	});
});
