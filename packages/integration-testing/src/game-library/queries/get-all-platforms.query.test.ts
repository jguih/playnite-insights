import { faker } from "@faker-js/faker";
import { api, factory } from "../../vitest.setup";

describe("Get All Platforms Query Handler", () => {
  it("returns an array of platforms", () => {
    // Arrange
    const platforms = api.gameLibrary.getPlatformRepository().all();
    const onePlatform = faker.helpers.arrayElement(platforms);
    // Act
    const result = api.gameLibrary.queries
      .getGetAllPlatformsQueryHandler()
      .execute();
    if (result.type !== "ok") throw new Error("Result type must be 'ok'");
    const oneResult = result.data.find((p) => p.Id === onePlatform.getId());
    // Assert
    expect(result.data.length === platforms.length).toBeTruthy();
    expect(onePlatform.getId()).toBe(oneResult?.Id);
    expect(onePlatform.getBackground()).toBe(oneResult?.Background);
    expect(onePlatform.getCover()).toBe(oneResult?.Cover);
    expect(onePlatform.getIcon()).toBe(oneResult?.Icon);
    expect(onePlatform.getName()).toBe(oneResult?.Name);
    expect(onePlatform.getSpecificationId()).toBe(oneResult?.SpecificationId);
  });

  it("returns null values as 'null' and not empty string", () => {
    // Arrange
    const onePlatform = factory
      .getPlatformFactory()
      .build({ background: null, cover: null, icon: null });
    api.gameLibrary.getPlatformRepository().add(onePlatform);
    const platforms = api.gameLibrary.getPlatformRepository().all();
    // Act
    const result = api.gameLibrary.queries
      .getGetAllPlatformsQueryHandler()
      .execute();
    if (result.type !== "ok") throw new Error("Result type must be 'ok'");
    const oneResult = result.data.find((p) => p.Id === onePlatform.getId());
    // Assert
    expect(result.data.length === platforms.length).toBeTruthy();
    expect(onePlatform.getBackground()).toBe(null);
    expect(onePlatform.getCover()).toBe(null);
    expect(onePlatform.getIcon()).toBe(null);
  });

  it("return 'not_modified' when provided a matching etag", () => {
    // Arrange
    // Act
    const firstResult = api.gameLibrary.queries
      .getGetAllPlatformsQueryHandler()
      .execute();
    if (firstResult.type !== "ok") throw new Error("Result type must be 'ok'");
    const secondResult = api.gameLibrary.queries
      .getGetAllPlatformsQueryHandler()
      .execute({ ifNoneMatch: firstResult.etag });
    // Assert
    expect(secondResult.type === "not_modified").toBeTruthy();
  });

  it("does not return 'not_modified' when platform list changes after first call", () => {
    // Arrange
    const newPlatform = factory.getPlatformFactory().build();
    // Act
    const firstResult = api.gameLibrary.queries
      .getGetAllPlatformsQueryHandler()
      .execute();
    if (firstResult.type !== "ok") throw new Error("Result type must be 'ok'");
    api.gameLibrary.getPlatformRepository().add(newPlatform);
    const secondResult = api.gameLibrary.queries
      .getGetAllPlatformsQueryHandler()
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
