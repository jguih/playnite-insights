import { ExtensionRegistration } from "@playnite-insights/lib/client";

export type ExtensionRegistrationRepository = {
  add: (
    registration: Omit<
      ExtensionRegistration,
      "Id" | "LastUpdatedAt" | "CreatedAt"
    >
  ) => void;
  update: (registration: ExtensionRegistration) => void;
  getByExtensionId: (
    extensionId: ExtensionRegistration["ExtensionId"]
  ) => ExtensionRegistration | null;
};
