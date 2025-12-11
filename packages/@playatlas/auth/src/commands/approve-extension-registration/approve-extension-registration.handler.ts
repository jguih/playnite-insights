import { LogService } from "@playatlas/common/application";
import { CommandHandler } from "@playatlas/common/common";
import { ExtensionRegistrationRepository } from "../../infra/extension-registration.repository.port";
import { ApproveExtensionRegistrationCommand } from "./approve-extension-registration.command";

export type ApproveExtensionRegistrationServiceDeps = {
  extensionRegistrationRepository: ExtensionRegistrationRepository;
  logService: LogService;
};

export type ApproveExtensionRegistrationServiceResult = {
  success: boolean;
  reason: string;
};

export type ApproveExtensionRegistrationCommandHandler = CommandHandler<
  ApproveExtensionRegistrationCommand,
  ApproveExtensionRegistrationServiceResult
>;

export const makeApproveExtensionRegistrationHandler = ({
  logService,
  extensionRegistrationRepository,
}: ApproveExtensionRegistrationServiceDeps): ApproveExtensionRegistrationCommandHandler => {
  return {
    execute: (command) => {
      const existing = extensionRegistrationRepository.getById(
        command.registrationId
      );
      if (!existing)
        return {
          success: false,
          reason: `Extension registration with id ${command.registrationId} not found`,
        };
      if (existing.isRejected())
        return {
          success: false,
          reason: "Cannot approve a rejected extension registration",
        };
      if (existing.isTrusted())
        return {
          success: false,
          reason: "Cannot approve an already approved extension registration",
        };
      if (!existing.isPending())
        return {
          success: false,
          reason: "Extension registration is not pending",
        };
      existing.approve();
      extensionRegistrationRepository.update(existing);
      logService.info(
        `Approved extension registration (Id: ${existing.getId()}, ExtensionId: ${existing.getExtensionId()})`
      );
      return {
        success: true,
        reason: "Approved",
      };
    },
  };
};
