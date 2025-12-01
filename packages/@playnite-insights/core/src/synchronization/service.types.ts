import type { ClientSyncReconciliationCommand } from "@playnite-insights/lib/client";
import type { GameNoteRepository } from "../types/game-note-repository";

export type SynchronizationService = {
  /**
   * Reconciles client sync state with server's.
   * @param command The client reconcile command
   */
  reconcile: (command: ClientSyncReconciliationCommand) => void;
};

export type SynchronizationServiceDeps = {
  gameNoteRepository: GameNoteRepository;
};
