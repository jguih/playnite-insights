import { type PlayniteLibraryManifest } from "@playnite-insights/lib/client";
import { join } from "path";
import { ApiError } from "../../../../@playatlas/system/src/core/api";
import type {
  LibraryManifestService,
  LibraryManifestServiceDeps,
} from "./service.types";

export const makeLibraryManifestService = ({
  getManifestData,
  fileSystemService,
  logService,
  LIBRARY_MANIFEST_FILE,
  FILES_DIR,
  CONTENT_HASH_FILE_NAME,
}: LibraryManifestServiceDeps): LibraryManifestService => {
  const write: LibraryManifestService["write"] = async () => {
    logService.debug("Writing library manifest...");
    try {
      const gamesInLibrary: PlayniteLibraryManifest["gamesInLibrary"] = [];
      const gamesManifestData = getManifestData();
      if (!gamesManifestData) {
        logService.warning(
          `Library manifest was not written due to missing library data`
        );
        return;
      }
      for (const data of gamesManifestData) {
        gamesInLibrary.push({ gameId: data.Id, contentHash: data.ContentHash });
      }
      // Get all library folders from files directory (one folder for each game)
      const entries = await fileSystemService.readdir(FILES_DIR, {
        withFileTypes: true,
      });
      const libraryFolders = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);
      const mediaExistsFor: PlayniteLibraryManifest["mediaExistsFor"] = [];
      // Read the contentHash.txt inside every library folder and append it to the manifest's `mediaExistsFor`
      for (const folder of libraryFolders) {
        if (folder == "placeholder") continue;
        const contentHashFilePath = join(
          FILES_DIR,
          folder,
          CONTENT_HASH_FILE_NAME
        );
        await fileSystemService.access(contentHashFilePath);
        const contentHash = await fileSystemService.readfile(
          contentHashFilePath,
          "utf-8"
        );
        mediaExistsFor.push({
          gameId: folder,
          contentHash: contentHash,
        });
      }
      const manifest: PlayniteLibraryManifest = {
        totalGamesInLibrary: gamesInLibrary.length,
        gamesInLibrary: gamesInLibrary,
        mediaExistsFor: mediaExistsFor,
      };
      await fileSystemService.writeFile(
        LIBRARY_MANIFEST_FILE,
        JSON.stringify(manifest, null, 2)
      );
      logService.success("Library manifest written successfully");
    } catch (error) {
      logService.error("Failed to write manifest.json", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        { error: { code: "internal_error" } },
        "Failed to write manifest.json",
        500,
        {
          cause: error,
        }
      );
    }
  };

  const get = async () => {
    try {
      const content = await fileSystemService.readfile(
        LIBRARY_MANIFEST_FILE,
        "utf-8"
      );
      const asJson = JSON.parse(content.toString()) as PlayniteLibraryManifest;
      logService.debug(
        `Read and parsed library manifest file at ${LIBRARY_MANIFEST_FILE}`
      );
      return asJson ?? null;
    } catch (error) {
      if (typeof error === "object" && error != null && "code" in error) {
        if (error.code === "ENOENT") {
          logService.warning("Library manifest file does not exist");
          return null;
        }
      }
      logService.error("Failed to load library manifest", error as Error);
      return null;
    }
  };

  return {
    write,
    get,
  };
};
