import type { CompanyResponseDto } from "@playatlas/game-library/dtos";
import { describe, expect, it } from "vitest";
import { api, testApi } from "../../vitest.global.setup";

describe("Game Library / Company", () => {
	it("persists a company", () => {
		// Arrange
		const company = testApi.factory.getCompanyFactory().build();
		testApi.seed.seedCompany(company);

		// Act
		const result = api.gameLibrary.queries.getGetAllCompaniesQueryHandler().execute();
		const companies = result.data;
		const addedCompany = companies.find((c) => c.Id === company.getId());

		// Assert
		expect(addedCompany).toBeDefined();
		expect(addedCompany).toMatchObject({
			Id: company.getId(),
			Name: company.getName(),
		} satisfies Partial<CompanyResponseDto>);
	});
});
