import { BaseEntityRepository } from "@playatlas/common/infra";
import type {
  ExtensionRegistration,
  ExtensionRegistrationExtensionId,
  ExtensionRegistrationId,
} from "../domain/extension-registration.entity";

export type ExtensionRegistrationRepository = BaseEntityRepository<
  ExtensionRegistrationId,
  ExtensionRegistration
> & {
  getByExtensionId: (
    extensionId: ExtensionRegistrationExtensionId
  ) => ExtensionRegistration | null;
};
