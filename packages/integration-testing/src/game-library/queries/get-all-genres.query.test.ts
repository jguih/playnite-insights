import { faker } from "@faker-js/faker";
import { api, factory } from "../../vitest.setup";

describe("Get All Genres Query Handler", () => {
  it("returns genres array", () => {
    // Arrange
    const genres = api.gameLibrary.getGenreRepository().all();
    const oneGenre = faker.helpers.arrayElement(genres);
    // Act
    const result = api.gameLibrary.queries
      .getGetAllGenresQueryHandler()
      .execute();
    if (result.type !== "ok") throw new Error("Result type must be 'ok'");
    const oneResult = result.data.find((p) => p.Id === oneGenre.getId());
    // Assert
    expect(result.data.length === genres.length).toBeTruthy();
    expect(oneGenre.getId()).toBe(oneResult?.Id);
    expect(oneGenre.getName()).toBe(oneResult?.Name);
  });

  it("return 'not_modified' when provided a matching etag", () => {
    // Arrange
    // Act
    const firstResult = api.gameLibrary.queries
      .getGetAllGenresQueryHandler()
      .execute();
    if (firstResult.type !== "ok") throw new Error("Invalid result");
    const secondResult = api.gameLibrary.queries
      .getGetAllGenresQueryHandler()
      .execute({ ifNoneMatch: firstResult.etag });
    // Assert
    expect(secondResult.type === "not_modified").toBeTruthy();
  });

  it("does not return 'not_modified' when genre list changes after first call", () => {
    // Arrange
    const newGenre = factory.getGenreFactory().build();
    // Act
    const firstResult = api.gameLibrary.queries
      .getGetAllGenresQueryHandler()
      .execute();
    if (firstResult.type !== "ok") throw new Error("Invalid result");
    api.gameLibrary.getGenreRepository().add(newGenre);
    const secondResult = api.gameLibrary.queries
      .getGetAllGenresQueryHandler()
      .execute({ ifNoneMatch: firstResult.etag });
    // Assert
    expect(secondResult.type === "not_modified").toBeFalsy();
    expect(
      secondResult.type === "ok" &&
        secondResult.data.length === firstResult.data.length + 1
    ).toBeTruthy();
    expect(
      secondResult.type === "ok" && secondResult.etag !== firstResult.etag
    ).toBeTruthy();
  });
});
