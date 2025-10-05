import type {
  SynchronizationService,
  SynchronizationServiceDeps,
} from "./service.types";

export const makeSynchronizationService = ({
  gameNoteRepository,
}: SynchronizationServiceDeps): SynchronizationService => {
  const reconsile: SynchronizationService["reconsile"] = (command) => {
    gameNoteRepository.reconsileFromSource(command.notes);
  };

  return { reconsile };
};
