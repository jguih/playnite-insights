import { SyncGameListCommand } from "@playnite-insights/lib/client";
import { join } from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeMocks } from "../../tests/mocks";
import { makePlayniteLibraryImporterService } from "./service";
import {
  PlayniteLibraryImporterService,
  PlayniteLibraryImporterServiceDeps,
} from "./service.types";

vi.mock("$lib/infrastructure/database", () => ({}));

const createDeps = () => {
  const mocks = makeMocks();
  return {
    ...mocks,
    FILES_DIR: "/files_dir",
  } satisfies PlayniteLibraryImporterServiceDeps;
};
let deps: ReturnType<typeof createDeps>;
let service: PlayniteLibraryImporterService;

describe("Game Importer", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    deps = createDeps();
    service = makePlayniteLibraryImporterService(deps);
  });

  it("should return error when importing invalid json body", async () => {
    // Arrange
    const invalidJson = { invalid: "data" } as unknown as SyncGameListCommand;
    // Act
    const result = await service.sync(invalidJson);
    // Assert
    expect(result).toBe(false);
  });

  it("should check if a game exists before trying to add it", async () => {
    // Arrange
    const data: SyncGameListCommand = {
      AddedItems: [
        {
          Id: "id1",
          Playtime: 12,
          ContentHash: "hash",
          IsInstalled: false,
          Hidden: false,
        },
      ],
      RemovedItems: [],
      UpdatedItems: [],
    };
    vi.spyOn(deps.playniteGameRepository, "exists").mockReturnValueOnce(true);
    const addSpy = vi.spyOn(deps.playniteGameRepository, "add");
    // Act
    const result = await service.sync(data);
    // Assert
    expect(addSpy).not.toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  it("should add a game if it doesnt exist", async () => {
    // Arrange
    const data: SyncGameListCommand = {
      AddedItems: [
        {
          Id: "id1",
          Playtime: 12,
          ContentHash: "hash",
          IsInstalled: false,
          Hidden: false,
        },
      ],
      RemovedItems: [],
      UpdatedItems: [],
    };
    vi.spyOn(deps.playniteGameRepository, "exists").mockReturnValueOnce(false);
    const addSpy = vi.spyOn(deps.playniteGameRepository, "add");
    // Act
    const result = await service.sync(data);
    // Assert
    expect(addSpy).toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  it("should not update game if it doesnt exist", async () => {
    // Arrange
    const data: SyncGameListCommand = {
      AddedItems: [],
      RemovedItems: [],
      UpdatedItems: [
        {
          Id: "id1",
          Playtime: 12,
          ContentHash: "hash",
          IsInstalled: false,
          Hidden: false,
        },
      ],
    };
    vi.spyOn(deps.playniteGameRepository, "exists").mockReturnValueOnce(false);
    const updateSpy = vi.spyOn(deps.playniteGameRepository, "update");
    // Act
    const result = await service.sync(data);
    // Assert
    expect(updateSpy).not.toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  it("should update a game if it exists", async () => {
    // Arrange
    const data: SyncGameListCommand = {
      AddedItems: [],
      RemovedItems: [],
      UpdatedItems: [
        {
          Id: "id1",
          Playtime: 12,
          ContentHash: "hash",
          IsInstalled: false,
          Hidden: false,
        },
      ],
    };
    vi.spyOn(deps.playniteGameRepository, "exists").mockReturnValueOnce(true);
    const updateSpy = vi.spyOn(deps.playniteGameRepository, "update");
    // Act
    const result = await service.sync(data);
    // Assert
    expect(updateSpy).toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  it("should delete a game and its media folder", async () => {
    // Arrange
    const data: SyncGameListCommand = {
      AddedItems: [],
      RemovedItems: ["id1"],
      UpdatedItems: [],
    };
    deps.playniteGameRepository.getById.mockReturnValueOnce({
      Id: "id1",
      Name: "test-game",
    });
    deps.playniteGameRepository.remove.mockReturnValueOnce(true);
    deps.gameSessionRepository.unlinkSessionsForGame.mockReturnValueOnce(true);
    // Act
    const result = await service.sync(data);
    // Assert
    expect(deps.fileSystemService.rm).toHaveBeenCalledWith(
      join(deps.FILES_DIR, "id1"),
      expect.anything()
    );
    expect(result).toBeTruthy();
  });
});
