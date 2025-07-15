import { join } from "path";
import { type LibraryManifestService } from "./types";
import { LogService } from "../log/types";
import { type PlayniteLibraryManifest } from "@playnite-insights/lib";
import { type PlayniteGameRepository } from "../playnite-game/repository";
import { type FileSystemService } from "../file-system/types";

type LibraryManifestServiceDeps = {
  getManifestData: PlayniteGameRepository["getManifestData"];
  fileSystemService: FileSystemService;
  logService: LogService;
  LIBRARY_MANIFEST_FILE: string;
  FILES_DIR: string;
  CONTENT_HASH_FILE_NAME: string;
};

export const makeLibraryManifestService = ({
  getManifestData,
  fileSystemService,
  logService,
  LIBRARY_MANIFEST_FILE,
  FILES_DIR,
  CONTENT_HASH_FILE_NAME,
}: LibraryManifestServiceDeps): LibraryManifestService => {
  const write = async () => {
    logService.debug("Writing library manifest...");
    try {
      const gamesInLibrary: PlayniteLibraryManifest["gamesInLibrary"] = [];
      const gamesManifestData = getManifestData();
      if (!gamesManifestData) {
        throw new Error("Failed to fetch manifest data");
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
      logService.success("manifest.json written successfully");
      return {
        isValid: true,
        message: "manifest.json written sucessfully",
        httpCode: 200,
        data: manifest,
      };
    } catch (error) {
      logService.error("Error while writing manifest.json", error as Error);
      return {
        isValid: false,
        message: "Failed to write manifest.json",
        httpCode: 500,
      };
    }
  };

  const get = async () => {
    try {
      logService.debug(
        `Reading library manifest file at ${LIBRARY_MANIFEST_FILE}`
      );
      const content = await fileSystemService.readfile(
        LIBRARY_MANIFEST_FILE,
        "utf-8"
      );
      const asJson = JSON.parse(content.toString()) as PlayniteLibraryManifest;
      logService.debug(
        `Read library manifest file succesfully, returning manifest`
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
