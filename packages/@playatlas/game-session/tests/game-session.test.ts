import { faker } from "@faker-js/faker";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeGameSessionService } from "../src/app/service/game-session";
import type { GameSession } from "../src/core/types/game-session";
import type {
  CloseGameSessionArgs,
  GameSessionService,
  GameSessionServiceDeps,
} from "../src/core/types/service/game-session";

let deps = {
  logService: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    debug: vi.fn(),
    LOG_LEVELS: 0,
    CURRENT_LOG_LEVEL: 0,
  },
  gameSessionRepository: {
    getById: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    all: vi.fn(),
    findAllBy: vi.fn(),
  },
} satisfies GameSessionServiceDeps;

let service: GameSessionService = makeGameSessionService(deps);

const getSession = ({
  status,
}: {
  status: GameSession["Status"];
}): GameSession => {
  return {
    SessionId: faker.string.uuid(),
    GameName: faker.science.chemicalElement().name,
    GameId: faker.string.uuid(),
    StartTime: faker.date.recent().toISOString(),
    Status: status,
    Duration: null,
    EndTime: null,
  };
};

describe("Game session service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("on close, fails with invalid command", () => {
    // Arrange
    const session = getSession({ status: "in_progress" });
    const now = new Date();
    const command: CloseGameSessionArgs = {
      ClientUtcNow: now.toISOString(),
      SessionId: session.SessionId,
      GameId: session.GameId!,
      GameName: "Test Game",
      StartTime: now.toISOString(),
      EndTime: null, // Invalid
      Duration: null, // Invalid
      Status: "closed",
    };
    // Act
    const result = service.close(command);
    // Assert
    expect(result).toBeFalsy();
  });

  it("on close, create new closed session", () => {
    // Arrange
    const now = new Date();
    const gameId = faker.string.uuid();
    const command: CloseGameSessionArgs = {
      ClientUtcNow: now.toISOString(),
      SessionId: faker.string.uuid(),
      GameId: gameId,
      GameName: "Test Game",
      StartTime: faker.date.recent().toISOString(),
      EndTime: now.toISOString(),
      Duration: 1200,
      Status: "closed",
    };
    deps.gameSessionRepository.getById.mockReturnValueOnce(undefined);
    deps.gameSessionRepository.add.mockReturnValueOnce(true);
    // Act
    const result = service.close(command);
    // Assert
    expect(deps.gameSessionRepository.add).toHaveBeenCalledOnce();
    expect(result).toBeTruthy();
  });

  it("on close, create new stale session", () => {
    // Arrange
    const now = new Date();
    const gameId = faker.string.uuid();
    const command: CloseGameSessionArgs = {
      ClientUtcNow: now.toISOString(),
      SessionId: faker.string.uuid(),
      GameId: gameId,
      GameName: faker.lorem.words(2),
      StartTime: faker.date.recent().toISOString(),
      EndTime: null,
      Duration: null,
      Status: "stale",
    };
    deps.gameSessionRepository.getById.mockReturnValueOnce(undefined);
    deps.gameSessionRepository.add.mockReturnValueOnce(true);
    // Act
    const result = service.close(command);
    // Assert
    expect(deps.gameSessionRepository.add).toHaveBeenCalledOnce();
    expect(result).toBeTruthy();
  });
});
