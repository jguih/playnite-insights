import { type GenreRepository } from "@playatlas/game-library/infra";
import { api, factory } from "../vitest.setup";

let repository: GenreRepository = api.gameLibrary.getGenreRepository();

describe("Genre Repository", () => {
  beforeEach(() => {
    repository = api.gameLibrary.getGenreRepository();
  });

  it("adds a new genre", () => {
    // Arrange
    const genre = factory.getGenreFactory().buildGenre();
    // Act
    repository.add(genre);
    const addedGenre = repository.getById(genre.getId());
    // Assert
    expect(addedGenre?.getId()).toBe(genre.getId());
    expect(addedGenre?.getName()).toBe(genre.getName());
  });

  it("returns all genres", () => {
    // Arrange
    const newGenresCount = 200;
    const newGenres = factory.getGenreFactory().buildGenreList(newGenresCount);
    // Act
    repository.upsert(newGenres);
    const genres = repository.all();
    // Assert
    expect(genres.length).toBeGreaterThanOrEqual(newGenresCount);
  });

  it("checks if a genre exists", () => {
    // Arrange
    const genre = factory.getGenreFactory().buildGenre();
    // Act
    repository.add(genre);
    const exists = repository.exists(genre.getId());
    // Assert
    expect(exists).toBe(true);
  });
});
