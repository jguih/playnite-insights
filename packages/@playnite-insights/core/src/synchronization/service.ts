import type {
  SynchronizationService,
  SynchronizationServiceDeps,
} from "./service.types";

export const makeSynchronizationService = ({
  gameNoteRepository,
}: SynchronizationServiceDeps): SynchronizationService => {
  const reconcile: SynchronizationService["reconcile"] = (command) => {
    gameNoteRepository.reconcileFromSource(command.notes);
  };

  return { reconcile };
};
