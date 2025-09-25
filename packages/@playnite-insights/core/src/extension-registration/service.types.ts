import {
  ExtensionRegistration,
  RegisterExtensionCommand,
} from "@playnite-insights/lib/client";
import { ExtensionRegistrationRepository } from "../types/extension-registration.types";
import { LogService } from "../types/log.types";

export type ExtensionRegistrationServiceDeps = {
  extensionRegistrationRepository: ExtensionRegistrationRepository;
  logService: LogService;
};

export type ExtensionRegistrationService = {
  register: (command: RegisterExtensionCommand) => number;
  revoke: (registrationId: ExtensionRegistration["Id"]) => void;
  remove: (registrationId: ExtensionRegistration["Id"]) => void;
  approve: (registrationId: ExtensionRegistration["Id"]) => void;
  reject: (registrationId: ExtensionRegistration["Id"]) => void;
};
