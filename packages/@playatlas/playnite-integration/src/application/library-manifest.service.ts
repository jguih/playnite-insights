import { join } from "path";
import { CONTENT_HASH_FILE_NAME } from "../constants";
import { LibraryManifest } from "./library-manifest";
import { libraryManifestSchema } from "./library-manifest.schema";
import type { LibraryManifestService } from "./library-manifest.service.port";
import type { LibraryManifestServiceDeps } from "./library-manifest.service.types";

export const makeLibraryManifestService = ({
  fileSystemService,
  logService,
  gameRepository,
  systemConfig,
}: LibraryManifestServiceDeps): LibraryManifestService => {
  const _getLibraryFolders = async (): Promise<string[]> => {
    const entries = await fileSystemService.readdir(
      systemConfig.getLibFilesDir(),
      {
        withFileTypes: true,
      }
    );
    const libraryFolders = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    return libraryFolders;
  };

  const write: LibraryManifestService["write"] = async () => {
    logService.debug("Writing library manifest...");
    const gamesInLibrary: LibraryManifest["gamesInLibrary"] = [];
    const gamesManifestData = gameRepository.getManifestData();
    for (const data of gamesManifestData) {
      gamesInLibrary.push({ gameId: data.Id, contentHash: data.ContentHash });
    }
    const libraryFolders = await _getLibraryFolders();
    const mediaExistsFor: LibraryManifest["mediaExistsFor"] = [];
    // Read the contentHash.txt inside every library folder and append it to the manifest's `mediaExistsFor`
    for (const folderName of libraryFolders) {
      const contentHashFilePath = join(
        systemConfig.getLibFilesDir(),
        folderName,
        CONTENT_HASH_FILE_NAME
      );
      try {
        await fileSystemService.access(contentHashFilePath);
        const contentHash = await fileSystemService.readfile(
          contentHashFilePath,
          "utf-8"
        );
        mediaExistsFor.push({
          gameId: folderName,
          contentHash: contentHash,
        });
      } catch (error) {
        logService.error(
          `Failed to read content hash file at ${contentHashFilePath} while writing library manifest. This entry will be skipped and not included in the written manifest.`,
          error
        );
        continue;
      }
    }
    const manifest: LibraryManifest = {
      totalGamesInLibrary: gamesInLibrary.length,
      gamesInLibrary: gamesInLibrary,
      mediaExistsFor: mediaExistsFor,
    };
    try {
      await fileSystemService.writeFile(
        systemConfig.getLibraryManifestFilePath(),
        JSON.stringify(manifest, null, 2)
      );
    } catch (error) {
      logService.error(`Failed to write library manifest`, error);
    }
    logService.success(
      `Library manifest written successfully: { totalGamesInLibrary: [${manifest.totalGamesInLibrary} entries], gamesInLibrary: [${manifest.gamesInLibrary.length} entries], mediaExistsFor: [${manifest.mediaExistsFor.length} entries] }`
    );
  };

  const get = async () => {
    try {
      const content = await fileSystemService.readfile(
        systemConfig.getLibraryManifestFilePath(),
        "utf-8"
      );
      const manifest = libraryManifestSchema.parse(content.toString());
      logService.debug(
        `Read and parsed library manifest file: { totalGamesInLibrary: [${manifest.totalGamesInLibrary} entries], gamesInLibrary: [${manifest.gamesInLibrary.length} entries], mediaExistsFor: [${manifest.mediaExistsFor.length} entries] }`
      );
      return manifest;
    } catch (error) {
      if (typeof error === "object" && error != null && "code" in error) {
        if (error.code === "ENOENT") {
          logService.warning("Library manifest file does not exist");
          return null;
        }
      }
      logService.error(
        "Failed to load or parse library manifest file",
        error as Error
      );
      return null;
    }
  };

  return {
    write,
    get,
  };
};
