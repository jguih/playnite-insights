import { ApiError } from "@playnite-insights/lib/client";
import {
  ExtensionRegistrationService,
  ExtensionRegistrationServiceDeps,
} from "./service.types";

export const makeExtensionRegistrationService = ({
  extensionRegistrationRepository,
  logService,
}: ExtensionRegistrationServiceDeps): ExtensionRegistrationService => {
  const register: ExtensionRegistrationService["register"] = (command) => {
    const existing = extensionRegistrationRepository.getByExtensionId(
      command.ExtensionId
    );
    if (existing && existing.Status !== "rejected")
      throw new ApiError(
        "Extension already registered, pending approval or trusted",
        400
      );
    else if (existing) {
      extensionRegistrationRepository.remove(existing.Id);
    }

    return extensionRegistrationRepository.add({
      ExtensionId: command.ExtensionId,
      PublicKey: command.PublicKey,
      ExtensionVersion: command.ExtensionVersion ?? null,
      Hostname: command.Hostname ?? null,
      Os: command.Os ?? null,
      Status: "pending",
    });
  };

  const revoke: ExtensionRegistrationService["revoke"] = (registrationId) => {
    const existing =
      extensionRegistrationRepository.getByRegistrationId(registrationId);
    if (!existing) throw new ApiError("Extension registration not found", 404);
    if (existing.Status !== "trusted")
      throw new ApiError("Cannot revoke pending or rejected registration", 400);
    existing.Status = "rejected";
    extensionRegistrationRepository.update(existing);
    logService.info(
      `Revoked extension registration (Id: ${existing.Id}, ExtensionId: ${existing.ExtensionId})`
    );
  };

  const remove: ExtensionRegistrationService["remove"] = (registrationId) => {
    const existing =
      extensionRegistrationRepository.getByRegistrationId(registrationId);
    if (!existing) return;
    if (existing.Status !== "rejected")
      throw new ApiError("Cannot remove pending or trusted registration", 400);
    extensionRegistrationRepository.remove(registrationId);
    logService.info(
      `Removed extension registration (Id: ${existing.Id}, ExtensionId: ${existing.ExtensionId})`
    );
  };

  const approve: ExtensionRegistrationService["approve"] = (registrationId) => {
    const existing =
      extensionRegistrationRepository.getByRegistrationId(registrationId);
    if (!existing) throw new ApiError("Extension registration not found", 404);
    if (existing.Status !== "pending")
      throw new ApiError(
        "Cannot approve rejected or trusted registration",
        400
      );
    existing.Status = "trusted";
    extensionRegistrationRepository.update(existing);
    logService.info(
      `Approved extension registration (Id: ${existing.Id}, ExtensionId: ${existing.ExtensionId})`
    );
  };

  const reject: ExtensionRegistrationService["reject"] = (registrationId) => {
    const existing =
      extensionRegistrationRepository.getByRegistrationId(registrationId);
    if (!existing) throw new ApiError("Extension registration not found", 404);
    if (existing.Status !== "pending")
      throw new ApiError("Cannot reject rejected or trusted registration", 400);
    existing.Status = "rejected";
    extensionRegistrationRepository.update(existing);
    logService.info(
      `Rejected extension registration (Id: ${existing.Id}, ExtensionId: ${existing.ExtensionId})`
    );
  };

  return { register, revoke, remove, approve, reject };
};
