import { extractSyncData } from "./sync-data.extractor";
import type {
  SyncGamesCommandHandler,
  SyncGamesServiceDeps,
} from "./sync-games.service.type";

export const makeSyncGamesCommandHandler = ({
  logService,
  gameRepository,
  genreRepository,
  platformRepository,
  companyRepository,
  completionStatusRepository,
  libraryManifestService,
}: SyncGamesServiceDeps): SyncGamesCommandHandler => {
  return {
    executeAsync: async ({ payload }) => {
      logService.info(
        `Syncing game library (add: ${payload.toAdd.length} games, update: ${payload.toUpdate.length} games, delete: ${payload.toRemove.length} games)`
      );

      const addedOrUpdated = [...payload.toAdd, ...payload.toUpdate];
      const extracted = extractSyncData(addedOrUpdated);

      genreRepository.upsert(extracted.genres);
      platformRepository.upsert(extracted.platforms);
      companyRepository.upsert(extracted.developers);
      companyRepository.upsert(extracted.publishers);
      completionStatusRepository.upsert(extracted.completionStatuses);
      gameRepository.upsert(extracted.games);
      gameRepository.remove(payload.toRemove);

      await libraryManifestService.write();

      logService.success(`Game library synchronized`);
      return {
        reason: "success",
        reason_code: "success",
        success: true,
      };
    },
  };
};
