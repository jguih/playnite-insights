import type { PlayAtlasTestApiV1 } from "@playatlas/bootstrap/testing";
import type { HorrorEvidenceGroup, ScoreBreakdown } from "@playatlas/game-library/application";
import {
	LATEST_SCORE_BREAKDOWN_SCHEMA_VERSION,
	SCORE_BREAKDOWN_SCHEMA_V1_0_0,
	scoreBreakdownSchemaV1_0_0,
	type CanonicalScoreBreakdown,
} from "@playatlas/game-library/dtos";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import z from "zod";
import { makeTestEnvironmentAsync, type TestEnvironment } from "../../../lib/environments";

const envelopeJson = (version: string, payload: unknown) =>
	JSON.stringify({ breakdownSchemaVersion: version, payload });

describe("Game Library /  Score Engine Breakdown Normalizer", () => {
	let env: TestEnvironment;
	let testApi: PlayAtlasTestApiV1;

	beforeEach(async () => {
		env = await makeTestEnvironmentAsync();
		({ testApi } = env);
	});

	afterEach(async () => {
		await env.disposeAsync();
	});

	it("returns normalized breakdown for valid payload", () => {
		// Arrange
		const rawBreakdown: ScoreBreakdown<HorrorEvidenceGroup> = {
			mode: "without_gate",
			groups: [],
			synergies: [],
			subtotal: 0,
			penalties: [],
			total: 0,
			normalizedTotal: 0,
			tier: "none",
		};
		const breakdown = testApi.gameLibrary.scoreEngine
			.getHorrorScoreEngine()
			.serializeBreakdown(rawBreakdown);

		// Act
		const result = testApi.gameLibrary.scoreEngine
			.getScoreBreakdownNormalizer()
			.normalize(breakdown);
		const resultBreakdown = result.type === "normalized" ? result.breakdown : null;
		const resultMigrated = result.type === "normalized" ? result.migrated : null;

		// Assert
		expect(result.type).toBe("normalized");
		expect(resultBreakdown).not.toBe(null);
		expect(resultBreakdown).toMatchObject(rawBreakdown);
		expect(resultMigrated).toBe(false);
	});

	it("normalizing a serialized normalized breakdown is stable", () => {
		// Arrange
		const rawBreakdown: CanonicalScoreBreakdown = {
			mode: "without_gate",
			groups: [],
			synergies: [],
			subtotal: 0,
			penalties: [],
			total: 0,
			normalizedTotal: 0,
			tier: "none",
		};
		const breakdown = envelopeJson(LATEST_SCORE_BREAKDOWN_SCHEMA_VERSION, rawBreakdown);

		const normalizer = testApi.gameLibrary.scoreEngine.getScoreBreakdownNormalizer();

		// Act
		const first = normalizer.normalize(breakdown);
		const firstPayload = first.type === "normalized" ? first.breakdown : null;

		const second = normalizer.normalize(
			envelopeJson(LATEST_SCORE_BREAKDOWN_SCHEMA_VERSION, firstPayload),
		);

		// Assert
		expect(second).toEqual(first);
	});

	it("throws on invalid JSON", () => {
		expect(() =>
			testApi.gameLibrary.scoreEngine.getScoreBreakdownNormalizer().normalize("not json"),
		).toThrow();
	});

	it("throws on invalid envelope", () => {
		// Arrange
		const envelope = JSON.stringify({ invalidVersionAttribute: "_", payload: {} });

		// Assert
		expect(() =>
			testApi.gameLibrary.scoreEngine.getScoreBreakdownNormalizer().normalize(envelope),
		).toThrow();
	});

	it("handles unknown schema version", () => {
		// Arrange
		const payload = { invalid: "payload" };

		// Act
		const result = testApi.gameLibrary.scoreEngine
			.getScoreBreakdownNormalizer()
			.normalize(envelopeJson("unknown_version", payload));
		const resultPayload = result.type === "raw" ? result.payload : null;

		// Assert
		expect(result.type).toBe("raw");
		expect(resultPayload).not.toBe(null);
		expect(resultPayload).toMatchObject(payload);
	});

	it("falls back to raw when payload validation fails", () => {
		const invalidPayload = { totally: "wrong" };

		const result = testApi.gameLibrary.scoreEngine
			.getScoreBreakdownNormalizer()
			.normalize(envelopeJson(LATEST_SCORE_BREAKDOWN_SCHEMA_VERSION, invalidPayload));
		const resultPayload = result.type === "raw" ? result.payload : null;

		expect(result.type).toBe("raw");
		expect(resultPayload).toEqual(invalidPayload);
	});

	it("migrates old breakdown schema version to latest", () => {
		// Arrange
		const payload: z.infer<typeof scoreBreakdownSchemaV1_0_0> = {
			mode: "without_gate",
			groups: [],
			synergy: { contribution: 0, details: "" },
			subtotal: 0,
			penalties: [],
			total: 0,
		};

		// Act
		const result = testApi.gameLibrary.scoreEngine
			.getScoreBreakdownNormalizer()
			.normalize(envelopeJson(SCORE_BREAKDOWN_SCHEMA_V1_0_0, payload));
		const resultPayload = result.type === "normalized" ? result.breakdown : null;
		const resultMigrated = result.type === "normalized" ? result.migrated : null;

		// Assert
		expect(resultPayload).not.toBe(null);
		expect(resultMigrated).toBe(true);
		expect(resultPayload?.synergies).toHaveLength(1);
		expect(resultPayload?.tier).toBe("none");
	});
});
