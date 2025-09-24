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

  return { register };
};
