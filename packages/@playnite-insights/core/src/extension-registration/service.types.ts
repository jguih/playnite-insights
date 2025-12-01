import type {
  ExtensionRegistration,
  RegisterExtensionCommand,
} from "@playnite-insights/lib/client";
import type { ExtensionRegistrationRepository } from "../types/extension-registration-repository";
import type { LogService } from "../types/log-service";

export type ExtensionRegistrationServiceDeps = {
  extensionRegistrationRepository: ExtensionRegistrationRepository;
  logService: LogService;
};

export type ExtensionRegistrationService = {
  register: (command: RegisterExtensionCommand) => {
    status: 201 | 409;
    registration: ExtensionRegistration;
  };
  revoke: (registrationId: ExtensionRegistration["Id"]) => void;
  remove: (registrationId: ExtensionRegistration["Id"]) => void;
  approve: (registrationId: ExtensionRegistration["Id"]) => void;
  reject: (registrationId: ExtensionRegistration["Id"]) => void;
};
