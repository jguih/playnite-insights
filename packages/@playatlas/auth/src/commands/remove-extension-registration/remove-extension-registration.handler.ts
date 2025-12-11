import { type LogService } from "@playatlas/common/application";
import { type CommandHandler } from "@playatlas/common/common";
import { type ExtensionRegistrationRepository } from "../../infra/extension-registration.repository.port";
import { type RemoveExtensionRegistrationCommand } from "./remove-extension-registration.command";

export type RemoveExtensionRegistrationServiceDeps = {
  extensionRegistrationRepository: ExtensionRegistrationRepository;
  logService: LogService;
};

export type RemoveExtensionRegistrationServiceResult =
  | {
      success: false;
      reason: string;
      reason_code: "not_found" | "invalid_operation";
    }
  | {
      success: true;
      reason: string;
      reason_code: "ok";
    };

export type RemoveExtensionRegistrationCommandHandler = CommandHandler<
  RemoveExtensionRegistrationCommand,
  RemoveExtensionRegistrationServiceResult
>;

export const makeRemoveExtensionRegistrationHandler = ({
  logService,
  extensionRegistrationRepository,
}: RemoveExtensionRegistrationServiceDeps): RemoveExtensionRegistrationCommandHandler => {
  return {
    execute: (command) => {
      const existing = extensionRegistrationRepository.getById(
        command.registrationId
      );
      if (!existing)
        return {
          success: false,
          reason_code: "not_found",
          reason: `Extension registration with id ${command.registrationId} not found`,
        };
      extensionRegistrationRepository.remove(existing.getId());
      logService.info(
        `Deleted extension registration (Id: ${existing.getId()}, ExtensionId: ${existing.getExtensionId()})`
      );
      return {
        success: true,
        reason_code: "ok",
        reason: "Removed",
      };
    },
  };
};
