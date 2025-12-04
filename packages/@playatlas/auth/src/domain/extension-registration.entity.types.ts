import type {
  ExtensionRegistrationId,
  ExtensionRegistrationStatus,
} from "./extension-registration.entity";

export type MakeExtensionRegistrationProps = {
  id: ExtensionRegistrationId;
  extensionId: string;
  publicKey: string;
  hostname: string | null;
  os: string | null;
  extensionVersion: string | null;
  status: ExtensionRegistrationStatus;
  createdAt?: Date;
  lastUpdatedAt?: Date;
};
