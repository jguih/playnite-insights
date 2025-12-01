import { ClientSyncReconciliationCommand } from "@playnite-insights/lib/client";
import { GameNoteFactory, makeMocks } from "@playnite-insights/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSynchronizationService } from "./service";
import { SynchronizationService } from "./service.types";

const mocks = makeMocks();
const gameNoteFactory = new GameNoteFactory();
let service: SynchronizationService;

describe("Synchronization Service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    service = makeSynchronizationService({ ...mocks });
  });

  it("on reconcile, reconcile game notes", () => {
    // Arrange
    const notes = gameNoteFactory.getNotes(200);
    const command: ClientSyncReconciliationCommand = {
      notes: notes,
    };
    // Act
    service.reconcile(command);
    // Assert
    expect(mocks.gameNoteRepository.reconcileFromSource).toHaveBeenCalledWith(
      notes
    );
  });
});
