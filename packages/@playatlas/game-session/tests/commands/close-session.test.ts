import { faker } from "@faker-js/faker";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CloseGameSessionCommand } from "../../src/commands/close-session/close-session.command";
import {
  makeCloseGameSessionService,
  type CloseGameSessionServiceDeps,
} from "../../src/commands/close-session/close-session.service";
import { makeGameSession } from "../../src/domain/game-session.entity";

let deps = {
  logger: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    debug: vi.fn(),
    CURRENT_LOG_LEVEL: 0,
  },
  repository: {
    findById: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    all: vi.fn(),
    findAllBy: vi.fn(),
  },
} satisfies CloseGameSessionServiceDeps;

const service = makeCloseGameSessionService({ ...deps });

describe("Game session service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("on close, create new closed session", () => {
    // Arrange
    const now = new Date();
    const gameId = faker.string.uuid();
    const command: CloseGameSessionCommand = {
      clientUtcNow: now.toISOString(),
      sessionId: faker.string.uuid(),
      gameId: gameId,
      gameName: "Test Game",
      startTime: faker.date.recent(),
      endTime: now,
      duration: 1200,
    };
    deps.repository.findById.mockReturnValueOnce(undefined);
    deps.repository.add.mockReturnValueOnce(true);
    // Act
    const result = service.execute(command);
    // Assert
    expect(deps.repository.add).toHaveBeenCalledOnce();
    expect(result.created).toBeTruthy();
  });

  it("on close, close existing in progress session", () => {
    // Arrange
    const now = new Date();
    const gameId = faker.string.uuid();
    const gameName = faker.lorem.words(3);
    const sessionId = faker.string.uuid();
    const startTime = faker.date.recent();
    const inProgressSession = makeGameSession({
      sessionId: sessionId,
      startTime,
      gameId,
      gameName,
    });
    const command: CloseGameSessionCommand = {
      clientUtcNow: now.toISOString(),
      sessionId,
      gameId,
      gameName,
      startTime,
      endTime: now,
      duration: 1200,
    };
    deps.repository.findById.mockReturnValueOnce(inProgressSession);
    deps.repository.update.mockReturnValueOnce(true);
    // Act
    const result = service.execute(command);
    // Assert
    expect(deps.repository.update).toHaveBeenCalledOnce();
    expect(result.created).toBeFalsy();
    expect(result.closed).toBeTruthy();
  });
});
