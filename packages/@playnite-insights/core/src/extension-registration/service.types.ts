import { RegisterExtensionCommand } from "@playnite-insights/lib/client";
import { ExtensionRegistrationRepository } from "../types/extension-registration.types";
import { LogService } from "../types/log.types";

export type ExtensionRegistrationServiceDeps = {
  extensionRegistrationRepository: ExtensionRegistrationRepository;
  logService: LogService;
};

export type ExtensionRegistrationService = {
  register: (command: RegisterExtensionCommand) => number;
};
