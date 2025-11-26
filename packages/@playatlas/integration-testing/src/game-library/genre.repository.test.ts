import { makeGenreRepository } from "@playatlas/game-library/infra";
import { makeGenreFactory } from "@playatlas/game-library/testing";
import { makeConsoleLogService } from "@playatlas/system/application";
import { getDb } from "../vitest.setup";

const genreFactory = makeGenreFactory();
const genreRepo = makeGenreRepository({
  getDb,
  logService: makeConsoleLogService("GenreRepository"),
});

describe("Genre Repository", () => {
  it("adds a new genre", () => {
    // Arrange
    const genre = genreFactory.buildGenre();
    // Act
    genreRepo.add(genre);
    const addedGenre = genreRepo.getById(genre.getId());
    // Assert
    expect(addedGenre?.getId()).toBe(genre.getId());
    expect(addedGenre?.getName()).toBe(genre.getName());
  });

  it("returns all genres", () => {
    // Arrange
    const newGenresCount = 200;
    const newGenres = genreFactory.buildGenreList(newGenresCount);
    // Act
    genreRepo.upsertMany(newGenres);
    const genres = genreRepo.all();
    // Assert
    expect(genres.length).toBeGreaterThanOrEqual(newGenresCount);
  });

  it("checks if a genre exists", () => {
    // Arrange
    const genre = genreFactory.buildGenre();
    // Act
    genreRepo.add(genre);
    const exists = genreRepo.exists(genre.getId());
    // Assert
    expect(exists).toBe(true);
  });
});
