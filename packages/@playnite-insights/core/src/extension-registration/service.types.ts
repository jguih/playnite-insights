import { RegisterExtensionCommand } from "@playnite-insights/lib/client";
import { ExtensionRegistrationRepository } from "../types/extension-registration.types";

export type ExtensionRegistrationServiceDeps = {
  extensionRegistrationRepository: ExtensionRegistrationRepository;
};

export type ExtensionRegistrationService = {
  register: (command: RegisterExtensionCommand) => void;
};
