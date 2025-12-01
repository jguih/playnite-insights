import type { ExtensionRegistration } from "@playnite-insights/lib/client";

export type ExtensionRegistrationRepository = {
  add: (registration: ExtensionRegistration) => void;
  update: (registration: ExtensionRegistration) => void;
  getByExtensionId: (
    extensionId: ExtensionRegistration["ExtensionId"]
  ) => ExtensionRegistration | null;
  getByRegistrationId: (
    id: ExtensionRegistration["Id"]
  ) => ExtensionRegistration | null;
  remove: (id: ExtensionRegistration["Id"]) => void;
  all: () => ExtensionRegistration[];
};
