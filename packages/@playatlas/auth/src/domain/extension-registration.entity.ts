import { InvalidStateError } from "@playatlas/common/domain";
import { extensionRegistrationStatus } from "./extension-registration.constants";
import { MakeExtensionRegistrationProps } from "./extension-registration.entity.types";

export type ExtensionRegistrationStatus =
  keyof typeof extensionRegistrationStatus;
export type ExtensionRegistrationId = number;
export type ExtensionRegistrationExtensionId = string;

export type ExtensionRegistration = Readonly<{
  getId: () => ExtensionRegistrationId;
  setId: (value: ExtensionRegistrationId) => void;
  getExtensionId: () => ExtensionRegistrationExtensionId;
  getPublicKey: () => string;
  getHostname: () => string | null;
  getOs: () => string | null;
  getExtensionVersion: () => string | null;
  getStatus: () => ExtensionRegistrationStatus;
  getCreatedAt: () => Date;
  setCreatedAt: (value: Date) => void;
  getLastUpdatedAt: () => Date;
  setLastUpdatedAt: (value: Date) => void;
}>;

export const makeExtensionRegistration = (
  props: MakeExtensionRegistrationProps
): ExtensionRegistration => {
  let _id = props.id;
  const _extensionId = props.extensionId;
  const _publicKey = props.publicKey;
  const _hostname = props.hostname;
  const _os = props.os;
  const _extensionVersion = props.extensionVersion;
  const _status = props.status;
  let _createdAt: Date | null = props.createdAt ?? null;
  let _lastUpdatedAt: Date | null = props.lastUpdatedAt ?? null;

  const extensionRegistration: ExtensionRegistration = {
    getId: () => _id,
    setId: (value) => (_id = value),
    getExtensionId: () => _extensionId,
    getPublicKey: () => _publicKey,
    getHostname: () => _hostname,
    getOs: () => _os,
    getExtensionVersion: () => _extensionVersion,
    getStatus: () => _status,
    getCreatedAt: () => {
      if (!_createdAt)
        throw new InvalidStateError(
          "Created At is null until the entity is persisted!"
        );
      return _createdAt;
    },
    setCreatedAt: (value) => (_createdAt = value),
    getLastUpdatedAt: () => {
      if (!_lastUpdatedAt)
        throw new InvalidStateError(
          "Last Updated At is null until the entity is persisted!"
        );
      return _lastUpdatedAt;
    },
    setLastUpdatedAt: (value) => (_lastUpdatedAt = value),
  };
  return Object.freeze(extensionRegistration);
};
