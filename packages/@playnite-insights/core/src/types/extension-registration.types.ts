import { ExtensionRegistration } from "@playnite-insights/lib/client";

export type ExtensionRegistrationRepository = {
  add: (
    registration: Omit<
      ExtensionRegistration,
      "Id" | "LastUpdatedAt" | "CreatedAt"
    >
  ) => ExtensionRegistration["Id"];
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
