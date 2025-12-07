import { EntityRepository } from "@playatlas/common/infra";
import type {
  ExtensionRegistration,
  ExtensionRegistrationExtensionId,
  ExtensionRegistrationId,
} from "../domain/extension-registration.entity";

export type ExtensionRegistrationRepository = EntityRepository<
  ExtensionRegistrationId,
  ExtensionRegistration
> & {
  getByExtensionId: (
    extensionId: ExtensionRegistrationExtensionId
  ) => ExtensionRegistration | null;
};
