import { faker } from "@faker-js/faker";
import type {
  CloseSessionCommand,
  GameSession,
  OpenSessionCommand,
} from "@playnite-insights/lib/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeMocks } from "../../tests/mocks";
import { makeGameSessionService } from "./service";
import type {
  GameSessionService,
  GameSessionServiceDeps,
} from "./service.types";

vi.mock("$lib/infrastructure/database", () => ({}));

const createDeps = () => {
  const mocks = makeMocks();
  return {
    ...mocks,
  } satisfies GameSessionServiceDeps;
};
let deps: ReturnType<typeof createDeps>;
let service: GameSessionService;

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
    deps = createDeps();
    service = makeGameSessionService(deps);
  });

  it("on open, fails when no existing game is found", () => {
    // Arrange
    deps.playniteGameRepository.getById.mockReturnValueOnce(undefined);
    const command: OpenSessionCommand = {
      ClientUtcNow: new Date().toISOString(),
      SessionId: faker.string.uuid(),
      GameId: faker.string.uuid(),
      StartTime: faker.date.recent().toISOString(),
    };
    // Act
    const result = service.open(command);
    // Assert
    expect(result).toBeFalsy();
  });

  it("on close, fails with invalid command", () => {
    // Arrange
    const session = getSession({ status: "in_progress" });
    const now = new Date();
    deps.playniteGameRepository.getById.mockReturnValueOnce(session);
    const command: CloseSessionCommand = {
      ClientUtcNow: now.toISOString(),
      SessionId: session.SessionId,
      GameId: session.GameId!,
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
    const command: CloseSessionCommand = {
      ClientUtcNow: now.toISOString(),
      SessionId: faker.string.uuid(),
      GameId: gameId,
      StartTime: faker.date.recent().toISOString(),
      EndTime: now.toISOString(),
      Duration: 1200,
      Status: "closed",
    };
    deps.gameSessionRepository.getById.mockReturnValueOnce(undefined);
    deps.playniteGameRepository.getById.mockReturnValueOnce({
      Name: "Test Game",
    });
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
    const command: CloseSessionCommand = {
      ClientUtcNow: now.toISOString(),
      SessionId: faker.string.uuid(),
      GameId: gameId,
      StartTime: faker.date.recent().toISOString(),
      EndTime: null,
      Duration: null,
      Status: "stale",
    };
    deps.gameSessionRepository.getById.mockReturnValueOnce(undefined);
    deps.playniteGameRepository.getById.mockReturnValueOnce({
      Name: "Test Game",
    });
    deps.gameSessionRepository.add.mockReturnValueOnce(true);
    // Act
    const result = service.close(command);
    // Assert
    expect(deps.gameSessionRepository.add).toHaveBeenCalledOnce();
    expect(result).toBeTruthy();
  });
});
