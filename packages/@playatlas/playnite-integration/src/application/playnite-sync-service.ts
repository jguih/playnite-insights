import type {
  PlayniteSynchronizationResult,
  PlayniteSyncService,
} from "./playnite-sync-service.port";
import type { PlayniteSyncServiceDeps } from "./playnite-sync-service.types";

export const makePlayniteSyncService = ({
  playniteMediaFilesHandler,
  gameRepository,
  logService,
}: PlayniteSyncServiceDeps): PlayniteSyncService => {
  const handleMediaFilesSynchronizationRequest: PlayniteSyncService["handleMediaFilesSynchronizationRequest"] =
    async (request) => {
      return await playniteMediaFilesHandler.withMediaFilesContext(
        request,
        async (context): Promise<PlayniteSynchronizationResult> => {
          if (!playniteMediaFilesHandler.verifyIntegrity(context))
            return {
              success: false,
              reason: "Integrity check validation failed",
              reason_code: "integrity_check_failed",
            };

          const game = gameRepository.getById(context.getGameId());
          if (!game)
            return {
              reason: "Game not found",
              reason_code: "game_not_found",
              success: false,
            };

          return { success: true, reason: "success", reason_code: "success" };
        }
      );
    };

  const handleGameLibrarySynchronizationRequest: PlayniteSyncService["handleGameLibrarySynchronizationRequest"] =
    async () => {};

  return {
    handleMediaFilesSynchronizationRequest,
    handleGameLibrarySynchronizationRequest,
  };
};
