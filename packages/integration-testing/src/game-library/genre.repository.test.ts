import { getFactories, getRepositories } from "../vitest.setup";

let repository: ReturnType<typeof getRepositories>;
let factory: ReturnType<typeof getFactories>;

describe("Genre Repository", () => {
  beforeEach(() => {
    repository = getRepositories();
    factory = getFactories();
  });

  it("adds a new genre", () => {
    // Arrange
    const genre = factory.getGenre().buildGenre();
    // Act
    repository.genre.add(genre);
    const addedGenre = repository.genre.getById(genre.getId());
    // Assert
    expect(addedGenre?.getId()).toBe(genre.getId());
    expect(addedGenre?.getName()).toBe(genre.getName());
  });

  it("returns all genres", () => {
    // Arrange
    const newGenresCount = 200;
    const newGenres = factory.getGenre().buildGenreList(newGenresCount);
    // Act
    repository.genre.upsertMany(newGenres);
    const genres = repository.genre.all();
    // Assert
    expect(genres.length).toBeGreaterThanOrEqual(newGenresCount);
  });

  it("checks if a genre exists", () => {
    // Arrange
    const genre = factory.getGenre().buildGenre();
    // Act
    repository.genre.add(genre);
    const exists = repository.genre.exists(genre.getId());
    // Assert
    expect(exists).toBe(true);
  });
});
