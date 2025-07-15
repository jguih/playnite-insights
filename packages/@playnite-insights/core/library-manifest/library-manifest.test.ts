import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeLibraryManifestService } from "../../../../playnite-insights/src/lib/services/library-manifest/library-manifest";
import { createMocks } from "../../../../playnite-insights/src/tests/mocks";
import { join } from "path";
import type { PlayniteLibraryManifest } from "./schemas";

vi.mock("$lib/infrastructure/database", () => ({}));

const createDeps = () => {
  const mocks = createMocks();
  return {
    ...mocks.fsAsyncDeps,
    logService: mocks.services.log,
    CONTENT_HASH_FILE_NAME: "contentHash.txt",
    FILES_DIR: "/files_dir",
    LIBRARY_MANIFEST_FILE: "/app/data/manifest.json",
    getManifestData: vi.fn(),
  };
};
let deps: ReturnType<typeof createDeps>;
let service: ReturnType<typeof makeLibraryManifestService>;

describe("Library manifest", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    deps = createDeps();
    service = makeLibraryManifestService(deps);
  });

  it("fails when no manifest data is found", async () => {
    // Arrange
    deps.getManifestData.mockReturnValueOnce(null);
    // Act
    const result = await service.write();
    // Assert
    expect(result.isValid).toBe(false);
    expect(deps.writeFile).not.toHaveBeenCalled();
  });

  it("reads media files directory when manifest data is found", async () => {
    // Arrange
    deps.getManifestData.mockReturnValueOnce([]);
    // Act
    await service.write();
    // Assert
    expect(deps.readdir).toHaveBeenCalledWith(
      deps.FILES_DIR,
      expect.anything()
    );
  });

  it("does not read media files directory when manifest data is not found", async () => {
    // Arrange
    deps.getManifestData.mockReturnValueOnce(null);
    // Act
    await service.write();
    // Assert
    expect(deps.readdir).not.toHaveBeenCalled();
  });

  it("should read contentHash.txt file and include its contents in the manifest", async () => {
    // Arrange
    deps.getManifestData.mockReturnValueOnce([]);
    deps.readdir.mockResolvedValueOnce([
      {
        isDirectory: () => true,
        name: "dir",
      },
    ]);
    const contentHashFilePath = join(
      deps.FILES_DIR,
      "dir",
      deps.CONTENT_HASH_FILE_NAME
    );
    // Act
    await service.write();
    // Assert
    expect(deps.readfile).toHaveBeenCalledWith(
      contentHashFilePath,
      expect.any(String)
    );
  });

  it("should write manifest file", async () => {
    // Arrange
    const manifestData = [{ Id: "id1", ContentHash: "hash1" }];
    const dirs = [
      {
        isDirectory: () => true,
        name: "dir1",
      },
      {
        isDirectory: () => false,
        name: "dir2",
      },
    ];
    const mediaHash = "my-random-hash";
    const manifest: PlayniteLibraryManifest = {
      gamesInLibrary: [{ gameId: "id1", contentHash: "hash1" }],
      mediaExistsFor: [{ gameId: "dir1", contentHash: mediaHash }],
      totalGamesInLibrary: 1,
    };
    deps.getManifestData.mockReturnValueOnce(manifestData);
    deps.readdir.mockResolvedValueOnce(dirs);
    deps.readfile.mockResolvedValueOnce("my-random-hash");
    // Act
    await service.write();
    // Assert
    expect(deps.writeFile).toHaveBeenCalled();
    const [calledPath, calledContent] = deps.writeFile.mock.calls[0];
    expect(calledPath).toBe(deps.LIBRARY_MANIFEST_FILE);
    expect(JSON.parse(calledContent)).toEqual(manifest);
  });

  it("should write manifest file with empty, but valid data", async () => {
    // Arrange
    const manifest: PlayniteLibraryManifest = {
      gamesInLibrary: [],
      mediaExistsFor: [],
      totalGamesInLibrary: 0,
    };
    deps.getManifestData.mockReturnValueOnce([]);
    deps.readdir.mockResolvedValueOnce([]);
    deps.readfile.mockResolvedValueOnce("");
    // Act
    await service.write();
    // Assert
    expect(deps.writeFile).toHaveBeenCalled();
    const [calledPath, calledContent] = deps.writeFile.mock.calls[0];
    expect(calledPath).toBe(deps.LIBRARY_MANIFEST_FILE);
    expect(JSON.parse(calledContent)).toEqual(manifest);
  });
});
