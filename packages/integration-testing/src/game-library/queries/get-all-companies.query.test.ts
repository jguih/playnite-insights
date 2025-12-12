import { api, factory } from "../../vitest.setup";

describe("Get All Companies Query Handler", () => {
  it("returns companies array", () => {
    // Arrange
    // Act
    const result = api.gameLibrary.queries
      .getGetAllCompaniesQueryHandler()
      .execute();
    // Assert
    expect(result.type === "ok" && result.data.length > 0).toBeTruthy();
  });

  it("return 'not_modified' when provided a matching etag", () => {
    // Arrange
    // Act
    const firstResult = api.gameLibrary.queries
      .getGetAllCompaniesQueryHandler()
      .execute();
    if (firstResult.type !== "ok") throw new Error("Invalid result");
    const secondResult = api.gameLibrary.queries
      .getGetAllCompaniesQueryHandler()
      .execute({ ifNoneMatch: firstResult.etag });
    // Assert
    expect(secondResult.type === "not_modified").toBeTruthy();
  });

  it("does not return 'not_modified' when company list changes after first call", () => {
    // Arrange
    const newCompany = factory.getCompanyFactory().build();
    // Act
    const firstResult = api.gameLibrary.queries
      .getGetAllCompaniesQueryHandler()
      .execute();
    if (firstResult.type !== "ok") throw new Error("Invalid result");
    api.gameLibrary.getCompanyRepository().add(newCompany);
    const secondResult = api.gameLibrary.queries
      .getGetAllCompaniesQueryHandler()
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
