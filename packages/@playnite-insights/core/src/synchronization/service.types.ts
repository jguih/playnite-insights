import type { ClientSyncReconciliationCommand } from "@playnite-insights/lib/client";
import type { GameNoteRepository } from "../types/game-note-repository";

export type SynchronizationService = {
  /**
   * Reconsiles client sync state with server's.
   * @param command The client reconsile command
   */
  reconsile: (command: ClientSyncReconciliationCommand) => void;
};

export type SynchronizationServiceDeps = {
  gameNoteRepository: GameNoteRepository;
};
