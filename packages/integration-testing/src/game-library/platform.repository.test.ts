import { getFactories, getRepositories } from "../vitest.setup";

let repository: ReturnType<typeof getRepositories>;
let factory: ReturnType<typeof getFactories>;

describe("Platform Repository", () => {
  beforeEach(() => {
    repository = getRepositories();
    factory = getFactories();
  });

  it("adds a new platform", () => {
    // Arrange
    const platform = factory.getPlatform().buildPlatform();
    // Act
    repository.platform.add(platform);
    const addedPlatform = repository.platform.getById(platform.getId());
    // Assert
    expect(addedPlatform).not.toBe(null);
    expect(addedPlatform?.getId()).toBe(platform.getId());
    expect(addedPlatform?.getName()).toBe(platform.getName());
    expect(addedPlatform?.getSpecificationId()).toBe(
      platform.getSpecificationId()
    );
  });

  it("returns all platforms", () => {
    // Arrange
    const newPlatformsCount = 200;
    const newPlatforms = factory
      .getPlatform()
      .buildPlatformList(newPlatformsCount);
    // Act
    repository.platform.upsertMany(newPlatforms);
    const platforms = repository.genre.all();
    // Assert
    expect(platforms.length).toBeGreaterThanOrEqual(newPlatformsCount);
  });

  it("checks if a platform exists", () => {
    // Arrange
    const platform = factory.getPlatform().buildPlatform();
    // Act
    repository.platform.add(platform);
    const exists = repository.platform.exists(platform.getId());
    // Assert
    expect(exists).toBe(true);
  });
});
