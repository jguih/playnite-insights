import type {
  ExtensionRegistration,
  ExtensionRegistrationExtensionId,
  ExtensionRegistrationId,
} from "../domain/extension-registration.entity";

export type ExtensionRegistrationRepository = {
  add: (registration: ExtensionRegistration) => void;
  update: (registration: ExtensionRegistration) => void;
  getByExtensionId: (
    extensionId: ExtensionRegistrationExtensionId
  ) => ExtensionRegistration | null;
  getById: (id: ExtensionRegistrationId) => ExtensionRegistration | null;
  remove: (id: ExtensionRegistrationId) => void;
  all: () => ExtensionRegistration[];
};
