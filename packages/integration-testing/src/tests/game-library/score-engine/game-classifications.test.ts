import type { PlayAtlasApiV1 } from "@playatlas/bootstrap/application";
import type { PlayAtlasTestApiV1 } from "@playatlas/bootstrap/testing";
import { CLASSIFICATION_IDS } from "@playatlas/common/domain";
import type { ScoreEngineVersion } from "@playatlas/game-library/application";
import {
	makeTestHorrorScoreEngine,
	type ITestHorrorScoreEnginePort,
} from "@playatlas/game-library/testing";
import {
	makeSyncGamesCommand,
	type SyncGamesRequestDto,
	type SyncGamesRequestDtoItem,
} from "@playatlas/playnite-integration/commands";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeTestEnvironmentAsync, type TestEnvironment } from "../../../lib/environments";

describe("Game Library / Score Engine Game Classifications", () => {
	let env: TestEnvironment;
	let api: PlayAtlasApiV1;
	let testApi: PlayAtlasTestApiV1;
	let horrorEngine: ITestHorrorScoreEnginePort;

	beforeEach(async () => {
		horrorEngine = makeTestHorrorScoreEngine();
		env = await makeTestEnvironmentAsync({ testDoubles: { scoreEngine: { horrorEngine } } });
		({ api, testApi } = env);
		testApi.seed.seedDefaultClassifications();
	});

	afterEach(async () => {
		await env.disposeAsync();
	});

	const syncGamesAsync = async (props: { items?: SyncGamesRequestDtoItem[] } = {}) => {
		const { items } = props;
		const sampleSize = items ? items.length : 2000;
		const addedItems = items
			? items
			: testApi.factory.getSyncGameRequestDtoFactory().buildList(sampleSize);

		const requestDto: SyncGamesRequestDto = {
			AddedItems: addedItems,
			RemovedItems: [],
			UpdatedItems: [],
		};

		const command = makeSyncGamesCommand(requestDto);

		const commandResult = await api.playniteIntegration.commands
			.getSyncGamesCommandHandler()
			.executeAsync(command);
		const queryResult = api.gameLibrary.queries.getGetAllGamesQueryHandler().execute();

		return { commandResult, queryResult };
	};

	it("creates one classification per game per engine", async () => {
		// Arrange
		const { commandResult, queryResult: gamesQueryResult } = await syncGamesAsync();
		expect(commandResult.success).toBe(true);

		// Act
		const queryResult = api.gameLibrary.scoreEngine.queries
			.getGetAllGameClassificationsQueryHandler()
			.execute();
		const expectedSize = gamesQueryResult.data.length * CLASSIFICATION_IDS.length;

		// Assert
		expect(queryResult.data).toHaveLength(expectedSize);
	});

	it("is idempotent when nothing changes", async () => {
		const syncItems = testApi.factory.getSyncGameRequestDtoFactory().buildList(2000);
		await syncGamesAsync({ items: syncItems });

		const firstQueryResult = api.gameLibrary.scoreEngine.queries
			.getGetAllGameClassificationsQueryHandler()
			.execute();

		await syncGamesAsync({ items: syncItems });

		const secondQueryResult = api.gameLibrary.scoreEngine.queries
			.getGetAllGameClassificationsQueryHandler()
			.execute();

		expect(firstQueryResult.data.length).toBe(secondQueryResult.data.length);
		expect(firstQueryResult).toEqual(secondQueryResult);
	});

	it("recalculate classification scores on engine version change", async () => {
		// Arrange
		const engineV1: ScoreEngineVersion = "v1.0.0";
		const engineV2: ScoreEngineVersion = "v2.0.0";
		const syncItems = testApi.factory.getSyncGameRequestDtoFactory().buildList(1);

		horrorEngine.setVersion(engineV1);
		horrorEngine.setScore(10);

		await syncGamesAsync({ items: syncItems });

		const firstQueryResult = api.gameLibrary.scoreEngine.queries
			.getGetAllGameClassificationsQueryHandler()
			.execute();
		const firstHorrorResults = firstQueryResult.data.filter((d) => d.ClassificationId === "HORROR");

		// Act
		horrorEngine.setVersion(engineV2);
		horrorEngine.setScore(100);

		await syncGamesAsync({ items: syncItems });

		const secondQueryResult = api.gameLibrary.scoreEngine.queries
			.getGetAllGameClassificationsQueryHandler()
			.execute();
		const secondHorrorResults = secondQueryResult.data.filter(
			(d) => d.ClassificationId === "HORROR",
		);

		// Assert
		expect(firstHorrorResults).toHaveLength(1);
		expect(firstHorrorResults.at(-1)?.Score).toBe(10);

		expect(secondHorrorResults).toHaveLength(1);
		expect(secondHorrorResults.at(-1)?.Score).toBe(100);
	});
});
