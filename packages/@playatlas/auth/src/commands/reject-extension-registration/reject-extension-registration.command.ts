import { ExtensionRegistrationId } from "../../domain";

export type RejectExtensionRegistrationCommand = {
  registrationId: ExtensionRegistrationId;
};
