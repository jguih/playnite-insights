import { ApiError } from "@playnite-insights/lib/client";
import {
  ExtensionRegistrationService,
  ExtensionRegistrationServiceDeps,
} from "./service.types";

export const makeExtensionRegistrationService = ({
  extensionRegistrationRepository,
}: ExtensionRegistrationServiceDeps): ExtensionRegistrationService => {
  const register: ExtensionRegistrationService["register"] = (command) => {
    const existing = extensionRegistrationRepository.getByExtensionId(
      command.ExtensionId
    );
    if (existing)
      throw new ApiError(
        "Extension already registered or pending approval",
        400
      );

    extensionRegistrationRepository.add({
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
