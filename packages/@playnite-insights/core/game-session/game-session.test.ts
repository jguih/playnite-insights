import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  GameSessionService,
  GameSessionServiceDeps,
} from "./service.types";
import { makeMocks } from "../tests/mocks";
import { makeGameSessionService } from "./service";
import type { OpenSessionCommand } from "@playnite-insights/lib";
import { faker } from "@faker-js/faker";

vi.mock("$lib/infrastructure/database", () => ({}));

const createDeps = () => {
  const mocks = makeMocks();
  return {
    ...mocks,
  } satisfies GameSessionServiceDeps;
};
let deps: ReturnType<typeof createDeps>;
let service: GameSessionService;

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
      SessionId: faker.string.uuid(),
      GameId: faker.string.uuid(),
      StartTime: faker.date.recent().toISOString(),
    };
    // Act
    const result = service.open(command);
    // Assert
    expect(result).toBeFalsy();
  });
});
