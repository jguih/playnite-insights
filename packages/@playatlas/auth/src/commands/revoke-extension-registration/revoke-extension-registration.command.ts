import { ExtensionRegistrationId } from "../../domain";

export type RevokeExtensionRegistrationCommand = {
  registrationId: ExtensionRegistrationId;
};
