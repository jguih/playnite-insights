import { validation } from "@playatlas/common/application";
import {
  BaseEntity,
  InvalidStateError,
  makeBaseEntity,
} from "@playatlas/common/domain";
import { extensionRegistrationStatus } from "./extension-registration.constants";
import {
  MakeExtensionRegistrationProps,
  makeExtensionRegistrationPropsSchema,
} from "./extension-registration.entity.props";

export type ExtensionRegistrationStatus =
  keyof typeof extensionRegistrationStatus;
export type ExtensionRegistrationId = number;
export type ExtensionRegistrationExtensionId = string;

export type ExtensionRegistration = BaseEntity<ExtensionRegistrationId> &
  Readonly<{
    getExtensionId: () => ExtensionRegistrationExtensionId;
    getPublicKey: () => string;
    getHostname: () => string | null;
    getOs: () => string | null;
    getExtensionVersion: () => string | null;
    getStatus: () => ExtensionRegistrationStatus;
  }>;

export const makeExtensionRegistration = (
  props: MakeExtensionRegistrationProps
): ExtensionRegistration => {
  const result = makeExtensionRegistrationPropsSchema.safeParse(props);
  if (!result.success)
    throw new InvalidStateError(
      `Invalid props passed to entity factory: ${result.error.message}`
    );

  const base = makeBaseEntity<ExtensionRegistrationId>(props);
  const _extension_id = props.extensionId;
  const _public_key = props.publicKey;
  const _hostname = props.hostname;
  const _os = props.os;
  const _extensionVersion = props.extensionVersion;
  const _status = props.status;

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
    base.validate();

    if (!(_status in extensionRegistrationStatus))
      throw new InvalidStateError(`Invalid status: ${_status}`);

    for (const f of NO_EMPTY_STRING_FIELDS)
      if (validation.isEmptyString(f.extract()))
        throw new InvalidStateError(
          validation.message.isEmptyString(f.name, f.extract())
        );

    for (const f of NULL_OR_NON_EMPTY_FIELDS)
      if (!validation.isNullOrNonEmptyString(f.extract()))
        throw new InvalidStateError(
          validation.message.isNullOrNonEmptyString(f.name, f.extract())
        );
  });

  _validate();

  const extensionRegistration: ExtensionRegistration = {
    ...base,
    getExtensionId: () => _extension_id,
    getPublicKey: () => _public_key,
    getHostname: () => _hostname,
    getOs: () => _os,
    getExtensionVersion: () => _extensionVersion,
    getStatus: () => _status,
    validate: _validate,
  };
  return Object.freeze(extensionRegistration);
};
