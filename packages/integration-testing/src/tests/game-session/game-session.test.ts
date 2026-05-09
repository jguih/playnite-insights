import { faker } from "@faker-js/faker";
import type { PlayAtlasApiV1 } from "@playatlas/bootstrap/application";
import type { PlayAtlasTestApiV1 } from "@playatlas/bootstrap/testing";
import type { DomainEvent } from "@playatlas/common/application";
import { GameSessionIdParser } from "@playatlas/common/domain";
import type { Game } from "@playatlas/game-library/domain";
import {
	makeCloseGameSessionCommand,
	makeOpenGameSessionCommand,
	type CloseGameSessionRequestDto,
	type OpenGameSessionRequestDto,
} from "@playatlas/game-session/commands";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeTestEnvironmentAsync, type TestEnvironment } from "../../lib/environments";
import { recordDomainEvents } from "../../test.lib";

describe("Game Sessions", () => {
	let game: Game;
	let unsubscribe: () => void;
	let events: DomainEvent[];
	let env: TestEnvironment;
	let api: PlayAtlasApiV1;
	let testApi: PlayAtlasTestApiV1;

	beforeEach(async () => {
		env = await makeTestEnvironmentAsync();
		({ api, testApi } = env);
		testApi.seed.seedGameRelationships(testApi.data.getGameRelationshipOptions());
		game = testApi.factory.getGameFactory().build();
		testApi.seed.seedGame(game);
		({ events, unsubscribe } = recordDomainEvents(api));
	});

	afterEach(async () => {
		unsubscribe();
		await env.disposeAsync();
	});

	it("opens a game session", () => {
		// Arrange
		testApi.getClock().setCurrent(new Date("2026-01-01T00:00:00Z"));
		const now = testApi.getClock().now().toISOString();

		const gameId = game.getPlayniteSnapshot()!.id;
		const sessionId = faker.string.uuid();

		const requestDto: OpenGameSessionRequestDto = {
			ClientUtcNow: now,
			GameId: gameId,
			SessionId: sessionId,
		};

		const command = makeOpenGameSessionCommand(requestDto);

		// Act
		const result = api.gameSession.commands.getOpenGameSessionCommandHandler().execute(command);

		// Assert
		expect(result.success).toBe(true);
		expect(result.reason_code).toBe("opened_game_session_created");

		expect(events).toHaveLength(1);
		expect(events).toEqual([
			expect.objectContaining({
				name: "opened-game-session",
				payload: {
					gameId: game.getId(),
					sessionId: GameSessionIdParser.fromExternal(sessionId),
				},
			} satisfies Partial<DomainEvent>),
		]);
	});

	it("fails when game doesn't exist", () => {
		// Arrange
		testApi.getClock().setCurrent(new Date("2026-01-01T00:00:00Z"));
		const now = testApi.getClock().now();

		const gameId = faker.string.uuid();
		const sessionId = faker.string.uuid();

		const requestDto: OpenGameSessionRequestDto = {
			ClientUtcNow: now.toISOString(),
			GameId: gameId,
			SessionId: sessionId,
		};

		const command = makeOpenGameSessionCommand(requestDto);

		// Act
		const result = api.gameSession.commands.getOpenGameSessionCommandHandler().execute(command);

		// Assert
		expect(result.success).toBe(false);
		expect(result.reason_code).toBe("game_not_found");

		expect(events).toHaveLength(0);
	});

	it("closes an in progress game session", () => {
		// Arrange
		testApi.getClock().setCurrent(new Date("2026-01-01T00:00:00Z"));
		const now = testApi.getClock().now().toISOString();

		const gameId = game.getPlayniteSnapshot()!.id;
		const sessionId = faker.string.uuid();

		const openRequestDto: OpenGameSessionRequestDto = {
			ClientUtcNow: now,
			GameId: gameId,
			SessionId: sessionId,
		};
		const openCommand = makeOpenGameSessionCommand(openRequestDto);
		const openResult = api.gameSession.commands
			.getOpenGameSessionCommandHandler()
			.execute(openCommand);
		expect(openResult.success).toBe(true);
		expect(openResult.reason_code).toBe("opened_game_session_created");

		testApi.getClock().advance(2000);
		const endTime = testApi.getClock().now().toISOString();

		const closeRequestDto: CloseGameSessionRequestDto = {
			ClientUtcNow: now,
			GameId: gameId,
			SessionId: sessionId,
			Duration: 30,
			EndTime: endTime,
			StartTime: now,
		};
		const closeCommand = makeCloseGameSessionCommand(closeRequestDto);

		// Act
		const closeResult = api.gameSession.commands
			.getCloseGameSessionCommandHandler()
			.execute(closeCommand);

		// Assert
		expect(closeResult.success).toBe(true);
		expect(closeResult.reason_code).toBe("closed_in_progress_game_session");

		expect(events).toHaveLength(2);
		expect(events).toEqual([
			expect.objectContaining({
				name: "opened-game-session",
				payload: {
					gameId: game.getId(),
					sessionId: GameSessionIdParser.fromExternal(sessionId),
				},
			} satisfies Partial<DomainEvent>),
			expect.objectContaining({
				name: "closed-game-session",
				payload: {
					gameId: game.getId(),
					sessionId: GameSessionIdParser.fromExternal(sessionId),
				},
			} satisfies Partial<DomainEvent>),
		]);
	});

	it("creates a new closed session when in progress doesn't exist", () => {
		// Arrange
		testApi.getClock().setCurrent(new Date("2026-01-01T00:00:00Z"));
		const now = testApi.getClock().now().toISOString();

		const gameId = game.getPlayniteSnapshot()!.id;
		const sessionId = faker.string.uuid();

		const closeRequestDto: CloseGameSessionRequestDto = {
			ClientUtcNow: now,
			GameId: gameId,
			SessionId: sessionId,
			Duration: faker.number.int({ min: 1000 }),
			EndTime: faker.date.future({ refDate: now }).toISOString(),
			StartTime: now,
		};
		const closeCommand = makeCloseGameSessionCommand(closeRequestDto);

		// Act
		const closeResult = api.gameSession.commands
			.getCloseGameSessionCommandHandler()
			.execute(closeCommand);

		// Assert
		expect(closeResult.success).toBe(true);
		expect(closeResult.reason_code).toBe("closed_game_session_created");

		expect(events).toHaveLength(1);
		expect(events).toEqual([
			expect.objectContaining({
				name: "closed-game-session",
				payload: {
					gameId: game.getId(),
					sessionId: GameSessionIdParser.fromExternal(sessionId),
				},
			} satisfies Partial<DomainEvent>),
		]);
	});

	it("gracefully handles closing an already closed session", () => {
		// Arrange
		testApi.getClock().setCurrent(new Date("2026-01-01T00:00:00Z"));
		const now = testApi.getClock().now().toISOString();

		const gameId = game.getPlayniteSnapshot()!.id;
		const sessionId = faker.string.uuid();

		const closeRequestDto: CloseGameSessionRequestDto = {
			ClientUtcNow: now,
			GameId: gameId,
			SessionId: sessionId,
			Duration: faker.number.int({ min: 1000 }),
			EndTime: faker.date.future({ refDate: now }).toISOString(),
			StartTime: now,
		};
		const closeCommand = makeCloseGameSessionCommand(closeRequestDto);

		// Act
		const closeResult1 = api.gameSession.commands
			.getCloseGameSessionCommandHandler()
			.execute(closeCommand);
		const closeResult2 = api.gameSession.commands
			.getCloseGameSessionCommandHandler()
			.execute(closeCommand);

		// Assert
		expect(closeResult1.success).toBe(true);
		expect(closeResult1.reason_code).toBe("closed_game_session_created");

		expect(closeResult2.success).toBe(true);
		expect(closeResult2.reason_code).toBe("game_session_is_already_closed");

		expect(events).toHaveLength(1);
		expect(events).toEqual([
			expect.objectContaining({
				name: "closed-game-session",
				payload: {
					gameId: game.getId(),
					sessionId: GameSessionIdParser.fromExternal(sessionId),
				},
			} satisfies Partial<DomainEvent>),
		]);
	});
});
