import { type ExtensionRegistration } from "@playnite-insights/lib/client";
import { ApiError } from "../../../../@playatlas/system/src/core/api";
import type {
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
    if (existing && existing.Status !== "rejected") {
      logService.debug(
        `Attempted to register extension (Id: ${existing.Id}, ExtensionId: ${existing.ExtensionId}) more than once`
      );
      return {
        status: 409,
        registration: existing,
      };
    } else if (existing) {
      extensionRegistrationRepository.remove(existing.Id);
    }

    const newRegistration: ExtensionRegistration = {
      Id: 0,
      ExtensionId: command.ExtensionId,
      PublicKey: command.PublicKey,
      ExtensionVersion: command.ExtensionVersion ?? null,
      Hostname: command.Hostname ?? null,
      Os: command.Os ?? null,
      Status: "pending",
      CreatedAt: new Date().toISOString(),
      LastUpdatedAt: new Date().toISOString(),
    };
    extensionRegistrationRepository.add(newRegistration);
    return { status: 201, registration: newRegistration };
  };

  const revoke: ExtensionRegistrationService["revoke"] = (registrationId) => {
    const existing =
      extensionRegistrationRepository.getByRegistrationId(registrationId);
    if (!existing)
      throw new ApiError(
        { error: { code: "not_found" } },
        "Extension registration not found",
        404
      );
    if (existing.Status !== "trusted")
      throw new ApiError(
        { error: { code: "bad_request" } },
        "Cannot revoke pending or rejected registration",
        400
      );
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
      throw new ApiError(
        { error: { code: "bad_request" } },
        "Cannot remove pending or trusted registration",
        400
      );
    extensionRegistrationRepository.remove(registrationId);
    logService.info(
      `Removed extension registration (Id: ${existing.Id}, ExtensionId: ${existing.ExtensionId})`
    );
  };

  const approve: ExtensionRegistrationService["approve"] = (registrationId) => {
    const existing =
      extensionRegistrationRepository.getByRegistrationId(registrationId);
    if (!existing)
      throw new ApiError(
        { error: { code: "not_found" } },
        "Extension registration not found",
        404
      );
    if (existing.Status !== "pending")
      throw new ApiError(
        { error: { code: "bad_request" } },
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
    if (!existing)
      throw new ApiError(
        { error: { code: "not_found" } },
        "Extension registration not found",
        404
      );
    if (existing.Status !== "pending")
      throw new ApiError(
        { error: { code: "bad_request" } },
        "Cannot reject rejected or trusted registration",
        400
      );
    existing.Status = "rejected";
    extensionRegistrationRepository.update(existing);
    logService.info(
      `Rejected extension registration (Id: ${existing.Id}, ExtensionId: ${existing.ExtensionId})`
    );
  };

  return { register, revoke, remove, approve, reject };
};
