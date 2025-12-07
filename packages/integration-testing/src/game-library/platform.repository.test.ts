import { PlatformRepository } from "@playatlas/game-library/infra";
import { api, factory } from "../vitest.setup";

let repository: PlatformRepository = api.gameLibrary.getPlatformRepository();

describe("Platform Repository", () => {
  beforeEach(() => {
    repository = api.gameLibrary.getPlatformRepository();
  });

  it("adds a new platform", () => {
    // Arrange
    const platform = factory.getPlatformFactory().build();
    // Act
    repository.add(platform);
    const addedPlatform = repository.getById(platform.getId());
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
      .getPlatformFactory()
      .buildList(newPlatformsCount);
    // Act
    repository.upsert(newPlatforms);
    const platforms = repository.all();
    // Assert
    expect(platforms.length).toBeGreaterThanOrEqual(newPlatformsCount);
  });

  it("checks if a platform exists", () => {
    // Arrange
    const platform = factory.getPlatformFactory().build();
    // Act
    repository.add(platform);
    const exists = repository.exists(platform.getId());
    // Assert
    expect(exists).toBe(true);
  });
});
