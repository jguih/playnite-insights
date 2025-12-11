import { type LogService } from "@playatlas/common/application";
import { type CommandHandler } from "@playatlas/common/common";
import { type ExtensionRegistrationRepository } from "../../infra/extension-registration.repository.port";
import { type RevokeExtensionRegistrationCommand } from "./revoke-extension-registration.command";

export type RevokeExtensionRegistrationServiceDeps = {
  extensionRegistrationRepository: ExtensionRegistrationRepository;
  logService: LogService;
};

export type RevokeExtensionRegistrationServiceResult =
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

export type RevokeExtensionRegistrationCommandHandler = CommandHandler<
  RevokeExtensionRegistrationCommand,
  RevokeExtensionRegistrationServiceResult
>;

export const makeRevokeExtensionRegistrationHandler = ({
  logService,
  extensionRegistrationRepository,
}: RevokeExtensionRegistrationServiceDeps): RevokeExtensionRegistrationCommandHandler => {
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
      if (existing.isRejected())
        return {
          success: false,
          reason_code: "invalid_operation",
          reason: "Cannot revoke an already rejected extension registration",
        };
      if (existing.isPending())
        return {
          success: false,
          reason_code: "invalid_operation",
          reason: "Cannot revoke a pending extension registration",
        };
      if (!existing.isTrusted())
        return {
          success: false,
          reason_code: "invalid_operation",
          reason: "Extension registration is not trusted",
        };
      existing.revoke();
      extensionRegistrationRepository.update(existing);
      logService.info(
        `Revoked extension registration (Id: ${existing.getId()}, ExtensionId: ${existing.getExtensionId()})`
      );
      return {
        success: true,
        reason_code: "ok",
        reason: "Rejected",
      };
    },
  };
};
