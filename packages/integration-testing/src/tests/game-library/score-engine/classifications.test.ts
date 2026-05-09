import { DEFAULT_CLASSIFICATIONS } from "@playatlas/game-library/commands";
import { describe, expect, it } from "vitest";
import { api, testApi } from "../../../vitest.global.setup";

describe("Game Library / Score Engine Classifications", () => {
	it("creates default classifications", () => {
		// Act
		testApi.gameLibrary.commands
			.getApplyDefaultClassificationsCommandHandler()
			.execute({ type: "default" });
		const { data: classifications } = api.gameLibrary.scoreEngine.queries
			.getGetAllClassificationsQueryHandler()
			.execute();
		const classificationIds = classifications.map((c) => c.Id);

		// Assert
		expect(classifications).toHaveLength(DEFAULT_CLASSIFICATIONS.length);
		expect(DEFAULT_CLASSIFICATIONS.every((c) => classificationIds.includes(c.id))).toBe(true);
	});

	it("command handler is idempotent", () => {
		// Act
		const handler = testApi.gameLibrary.commands.getApplyDefaultClassificationsCommandHandler();

		handler.execute({ type: "default" });
		handler.execute({ type: "default" });
		handler.execute({ type: "default" });

		const { data: classifications } = api.gameLibrary.scoreEngine.queries
			.getGetAllClassificationsQueryHandler()
			.execute();

		// Assert
		expect(classifications).toHaveLength(DEFAULT_CLASSIFICATIONS.length);
	});

	it("updates classifications on version change", () => {
		// Arrange
		const v1 = "v1.0.0";
		const v2 = "v2.0.0";

		const handler = testApi.gameLibrary.commands.getApplyDefaultClassificationsCommandHandler();
		const classificationsV1 = [...DEFAULT_CLASSIFICATIONS].map((c) => ({
			...c,
			version: v1,
		}));

		handler.execute({
			type: "override",
			buildDefaultClassificationsOverride: ({ classificationFactory: f }) => {
				return classificationsV1.map((c) => f.create({ ...c }));
			},
		});

		const firstQueryResult = api.gameLibrary.scoreEngine.queries
			.getGetAllClassificationsQueryHandler()
			.execute();

		const classificationsV2 = [...DEFAULT_CLASSIFICATIONS].map((c) => ({
			...c,
			version: v2,
		}));

		// Act
		handler.execute({
			type: "override",
			buildDefaultClassificationsOverride: ({ classificationFactory: f }) => {
				return classificationsV2.map((c) => f.create({ ...c }));
			},
		});

		const secondQueryResult = api.gameLibrary.scoreEngine.queries
			.getGetAllClassificationsQueryHandler()
			.execute();

		// Assert
		expect(firstQueryResult.data).toHaveLength(secondQueryResult.data.length);

		for (const c of firstQueryResult.data) {
			expect(c.Version).toBe(v1);
		}

		for (const c of secondQueryResult.data) {
			expect(c.Version).toBe(v2);
		}
	});

	it("soft delete existing classifications if missing from default list", () => {
		// Arrange
		const handler = testApi.gameLibrary.commands.getApplyDefaultClassificationsCommandHandler();

		handler.execute({
			type: "default",
		});

		const firstQueryResult = api.gameLibrary.scoreEngine.queries
			.getGetAllClassificationsQueryHandler()
			.execute();

		// Act
		handler.execute({
			type: "override",
			buildDefaultClassificationsOverride: () => [],
		});

		const secondQueryResult = api.gameLibrary.scoreEngine.queries
			.getGetAllClassificationsQueryHandler()
			.execute();

		// Assert
		expect(firstQueryResult.data).toHaveLength(DEFAULT_CLASSIFICATIONS.length);
		expect(secondQueryResult.data).toHaveLength(DEFAULT_CLASSIFICATIONS.length);

		for (const classification of secondQueryResult.data) {
			expect(classification.Sync.DeletedAt).not.toBe(null);
		}
	});

	it("restores soft-deleted classifications if they reappear", () => {
		// Arrange
		const handler = testApi.gameLibrary.commands.getApplyDefaultClassificationsCommandHandler();

		handler.execute({ type: "default" });

		handler.execute({
			type: "override",
			buildDefaultClassificationsOverride: () => [],
		});

		// Act
		handler.execute({ type: "default" });

		const result = api.gameLibrary.scoreEngine.queries
			.getGetAllClassificationsQueryHandler()
			.execute();

		// Assert
		expect(result.data).toHaveLength(DEFAULT_CLASSIFICATIONS.length);

		for (const classification of result.data) {
			expect(classification.Sync.DeletedAt).toBe(null);
		}
	});
});
