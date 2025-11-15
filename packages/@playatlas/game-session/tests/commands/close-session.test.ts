import { faker } from "@faker-js/faker";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  makeCloseGameSessionCommand,
  type CloseGameSessionCommand,
} from "../../src/commands/close-session/close-session.command";
import {
  closeGameSessionRequestDtoSchema,
  type CloseGameSessionRequestDto,
} from "../../src/commands/close-session/close-session.request.dto";
import {
  makeCloseGameSessionService,
  type CloseGameSessionServiceDeps,
} from "../../src/commands/close-session/close-session.service";
import {
  makeClosedGameSession,
  makeGameSession,
  type GameSession,
} from "../../src/domain/game-session.entity";
import {
  GameSessionAlreadyClosedError,
  InvalidGameSessionDurationError,
} from "../../src/domain/game-session.errors";

let deps = {
  logService: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    debug: vi.fn(),
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

const factory = {
  makeInProgressSession: (): GameSession =>
    makeGameSession({
      sessionId: faker.string.uuid(),
      startTime: faker.date.recent(),
      gameId: faker.string.uuid(),
      gameName: faker.lorem.words(3),
    }),
  makeClosedSession: (now: Date): GameSession =>
    makeClosedGameSession({
      sessionId: faker.string.uuid(),
      startTime: faker.date.recent(),
      gameId: faker.string.uuid(),
      gameName: faker.lorem.words(3),
      duration: faker.number.int({ min: 0, max: 3200 }),
      endTime: now,
    }),
};

describe("Close Game Session Service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("create new closed session", () => {
    // Arrange
    const now = new Date();
    const gameId = faker.string.uuid();
    const requestDto: CloseGameSessionRequestDto = {
      ClientUtcNow: now.toISOString(),
      SessionId: faker.string.uuid(),
      GameId: gameId,
      StartTime: faker.date.recent().toISOString(),
      EndTime: now.toISOString(),
      Duration: 1200,
    };
    const command: CloseGameSessionCommand = makeCloseGameSessionCommand(
      requestDto,
      faker.lorem.words(3)
    );
    deps.repository.findById.mockReturnValueOnce(undefined);
    deps.repository.add.mockReturnValueOnce(true);
    // Act
    const result = service.execute(command);
    // Assert
    expect(() =>
      closeGameSessionRequestDtoSchema.parse(requestDto)
    ).not.toThrow();
    expect(deps.repository.add).toHaveBeenCalledOnce();
    expect(result.created).toBeTruthy();
  });

  it("close existing in progress session", () => {
    // Arrange
    const now = new Date();
    const inProgressSession = factory.makeInProgressSession();
    const requestDto: CloseGameSessionRequestDto = {
      ClientUtcNow: now.toISOString(),
      SessionId: inProgressSession.getSessionId(),
      GameId: inProgressSession.getGameId()!,
      StartTime: inProgressSession.getStartTime().toISOString(),
      EndTime: now.toISOString(),
      Duration: 1200,
    };
    const command: CloseGameSessionCommand = makeCloseGameSessionCommand(
      requestDto,
      inProgressSession.getGameName()
    );
    deps.repository.findById.mockReturnValueOnce(inProgressSession);
    deps.repository.update.mockReturnValueOnce(true);
    // Act
    const result = service.execute(command);
    // Assert
    expect(() =>
      closeGameSessionRequestDtoSchema.parse(requestDto)
    ).not.toThrow();
    expect(deps.repository.update).toHaveBeenCalledOnce();
    expect(result.created).toBeFalsy();
    expect(result.closed).toBeTruthy();
  });

  it.each([{ duration: -30 }, { duration: -4000 }, { duration: -1 }])(
    "throws when closing a session with an invalid duration",
    ({ duration }) => {
      // Arrange
      const now = new Date();
      const inProgress = factory.makeInProgressSession();
      const requestDto: CloseGameSessionRequestDto = {
        ClientUtcNow: now.toISOString(),
        SessionId: inProgress.getSessionId(),
        GameId: inProgress.getGameId()!,
        StartTime: inProgress.getStartTime().toISOString(),
        EndTime: now.toISOString(),
        Duration: duration,
      };
      const command: CloseGameSessionCommand = makeCloseGameSessionCommand(
        requestDto,
        inProgress.getGameName()
      );
      deps.repository.findById.mockReturnValueOnce(inProgress);
      // Act & Assert
      expect(() =>
        closeGameSessionRequestDtoSchema.parse(requestDto)
      ).not.toThrow();
      expect(() => service.execute(command)).toThrowError(
        InvalidGameSessionDurationError
      );
      expect(deps.repository.update).not.toHaveBeenCalled();
    }
  );

  it("throws when attempting to close an already closed session", () => {
    // Arrange
    const now = new Date();
    const closed = factory.makeClosedSession(now);
    const requestDto: CloseGameSessionRequestDto = {
      ClientUtcNow: now.toISOString(),
      SessionId: closed.getSessionId(),
      GameId: closed.getGameId()!,
      StartTime: closed.getStartTime().toISOString(),
      EndTime: closed.getEndTime()!.toISOString(),
      Duration: closed.getDuration()!,
    };
    const command = makeCloseGameSessionCommand(
      requestDto,
      closed.getGameName()
    );
    deps.repository.findById.mockReturnValueOnce(closed);
    // Act & Assert
    expect(() =>
      closeGameSessionRequestDtoSchema.parse(requestDto)
    ).not.toThrow();
    expect(() => service.execute(command)).toThrowError(
      GameSessionAlreadyClosedError
    );
    expect(deps.repository.update).not.toHaveBeenCalled();
  });
});
