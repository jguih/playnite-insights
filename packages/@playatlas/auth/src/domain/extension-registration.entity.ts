import { extensionRegistrationStatus } from "./extension-registration.constants";
import { MakeExtensionRegistrationProps } from "./extension-registration.entity.types";

export type ExtensionRegistrationStatus =
  keyof typeof extensionRegistrationStatus;
export type ExtensionRegistrationId = number;
export type ExtensionRegistrationExtensionId = string;

export type ExtensionRegistration = Readonly<{
  getId: () => ExtensionRegistrationId;
  getExtensionId: () => ExtensionRegistrationExtensionId;
  getPublicKey: () => string;
  getHostname: () => string | null;
  getOs: () => string | null;
  getExtensionVersion: () => string | null;
  getStatus: () => ExtensionRegistrationStatus;
  getCreatedAt: () => Date;
  getLastUpdatedAt: () => Date;
}>;

export const makeExtensionRegistration = (
  props: MakeExtensionRegistrationProps
): ExtensionRegistration => {
  const _id = props.id;
  const _extensionId = props.extensionId;
  const _publicKey = props.publicKey;
  const _hostname = props.hostname;
  const _os = props.os;
  const _extensionVersion = props.extensionVersion;
  const _status = props.status;
  const _createdAt = props.createdAt;
  const _lastUpdatedAt = props.lastUpdatedAt;

  const extensionRegistration = {
    getId: () => _id,
    getExtensionId: () => _extensionId,
    getPublicKey: () => _publicKey,
    getHostname: () => _hostname,
    getOs: () => _os,
    getExtensionVersion: () => _extensionVersion,
    getStatus: () => _status,
    getCreatedAt: () => _createdAt,
    getLastUpdatedAt: () => _lastUpdatedAt,
  };
  return Object.freeze(extensionRegistration);
};
