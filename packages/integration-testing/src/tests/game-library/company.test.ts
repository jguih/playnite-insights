import type { PlayAtlasApiV1 } from "@playatlas/bootstrap/application";
import type { PlayAtlasTestApiV1 } from "@playatlas/bootstrap/testing";
import type { CompanyResponseDto } from "@playatlas/game-library/dtos";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeTestEnvironmentAsync, type TestEnvironment } from "../../lib/environments";

describe("Game Library / Company", () => {
	let env: TestEnvironment;
	let api: PlayAtlasApiV1;
	let testApi: PlayAtlasTestApiV1;

	beforeEach(async () => {
		env = await makeTestEnvironmentAsync();
		({ api, testApi } = env);
	});

	afterEach(async () => {
		await env.disposeAsync();
	});

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
