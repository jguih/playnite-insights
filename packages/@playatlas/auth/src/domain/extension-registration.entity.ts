import { validation } from "@playatlas/common/application";
import { BaseEntity, InvalidStateError } from "@playatlas/common/domain";
import { extensionRegistrationStatus } from "./extension-registration.constants";
import { buildExtensionRegistrationPropsSchema } from "./extension-registration.entity.schemas";
import {
  BuildExtensionRegistrationProps,
  MakeExtensionRegistrationProps,
  RehydrateExtensionRegistrationProps,
} from "./extension-registration.entity.types";

export type ExtensionRegistrationStatus =
  keyof typeof extensionRegistrationStatus;
export type ExtensionRegistrationId = number;
export type ExtensionRegistrationExtensionId = string;

export type ExtensionRegistration = BaseEntity<ExtensionRegistrationId> &
  Readonly<{
    setId: (value: ExtensionRegistrationId) => void;
    getExtensionId: () => ExtensionRegistrationExtensionId;
    getPublicKey: () => string;
    getHostname: () => string | null;
    getOs: () => string | null;
    getExtensionVersion: () => string | null;
    getStatus: () => ExtensionRegistrationStatus;
    getCreatedAt: () => Date;
    getLastUpdatedAt: () => Date;
    isTrusted: () => boolean;
    isPending: () => boolean;
    isRejected: () => boolean;
    approve: () => void;
  }>;

const buildExtensionRegistration = (
  props: BuildExtensionRegistrationProps
): ExtensionRegistration => {
  const result = buildExtensionRegistrationPropsSchema.safeParse(props);
  if (!result.success)
    throw new InvalidStateError(
      `Invalid props passed to entity factory: ${result.error.message}`
    );

  const now = new Date();
  let _id: ExtensionRegistrationId | null = props.id ?? null;
  const _extension_id = props.extensionId;
  const _public_key = props.publicKey;
  const _hostname = props.hostname;
  const _os = props.os;
  const _extensionVersion = props.extensionVersion;
  let _status: ExtensionRegistrationStatus = props.status ?? "pending";
  const _createdAt: Date = props.createdAt ?? now;
  let _lastUpdatedAt: Date = props.lastUpdatedAt ?? now;

  const NO_EMPTY_STRING_FIELDS = [
    { name: "Extension Id", extract: () => _extension_id },
    { name: "Public Key", extract: () => _public_key },
  ] as const;

  const NULL_OR_NON_EMPTY_FIELDS = [
    { name: "Hostname", extract: () => _hostname },
    { name: "Os", extract: () => _os },
    { name: "Extension Version", extract: () => _extensionVersion },
  ] as const;

  const _validate = Object.freeze(() => {
    if (!(_status in extensionRegistrationStatus))
      throw new InvalidStateError(`Invalid status: ${_status}`);

    for (const f of NO_EMPTY_STRING_FIELDS)
      if (validation.isEmptyString(f.extract()))
        throw new InvalidStateError(validation.message.isEmptyString(f.name));

    for (const f of NULL_OR_NON_EMPTY_FIELDS)
      if (!validation.isNullOrNonEmptyString(f.extract()))
        throw new InvalidStateError(
          validation.message.isNullOrNonEmptyString(f.name, f.extract())
        );
  });

  const _touch = () => {
    _lastUpdatedAt = new Date();
  };

  _validate();

  const extensionRegistration: ExtensionRegistration = {
    getId: () => {
      if (!_id)
        throw new InvalidStateError(
          "Id is null until the entity is persisted!"
        );
      return _id;
    },
    getSafeId: () => (_id ? String(_id) : "<not_persisted>"),
    setId: (value) => {
      if (_id) throw new InvalidStateError("Id is already set");
      _id = value;
    },
    getExtensionId: () => _extension_id,
    getPublicKey: () => _public_key,
    getHostname: () => _hostname,
    getOs: () => _os,
    getExtensionVersion: () => _extensionVersion,
    getStatus: () => _status,
    getCreatedAt: () => _createdAt,
    getLastUpdatedAt: () => _lastUpdatedAt,
    validate: _validate,
    isTrusted: () => _status === "trusted",
    isPending: () => _status === "rejected",
    isRejected: () => _status === "rejected",
    approve: () => {
      if (_status !== "pending")
        throw new InvalidStateError("Cannot approve non-pending registration");
      _status = "trusted";
      _touch();
    },
  };
  return Object.freeze(extensionRegistration);
};

export const makeExtensionRegistration = (
  props: MakeExtensionRegistrationProps
) => {
  return buildExtensionRegistration({ ...props, status: "pending" });
};

export const rehydrateExtensionRegistration = (
  props: RehydrateExtensionRegistrationProps
) => {
  return buildExtensionRegistration(props);
};
