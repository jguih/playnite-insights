import { validation } from "@playatlas/common/application";
import {
  BaseEntity,
  InvalidArgumentError,
  InvalidStateError,
} from "@playatlas/common/domain";
import { buildInstanceAuthSettingsPropsSchema } from "./instance-auth-settings.entity.schemas";
import {
  BuildInstanceAuthSettingsProps,
  MakeInstanceAuthSettingsProps,
  RehydrateInstanceAuthSettingsProps,
} from "./instance-auth-settings.entity.types";

export type InstanceAuthSettingsId = 1;
export type InstanceAuthSettings = BaseEntity<InstanceAuthSettingsId> &
  Readonly<{
    getPasswordHash: () => string;
    setInstanceCredentials: (props: { hash: string; salt: string }) => void;
    getSalt: () => string;
    getCreatedAt: () => Date;
    getLastUpdatedAt: () => Date;
  }>;

const buildInstanceAuthSettings = (
  props: BuildInstanceAuthSettingsProps
): InstanceAuthSettings => {
  const result = buildInstanceAuthSettingsPropsSchema.safeParse(props);
  if (!result.success)
    throw new InvalidStateError(
      `Invalid props passed to entity factory: ${result.error.message}`
    );

  const now = new Date();
  let _password_hash = props.passwordHash;
  let _salt = props.salt;
  const _created_at = props.createdAt ?? now;
  let _last_updated_at = props.lastUpdatedAt ?? now;

  const _validate = () => {
    if (validation.isNullOrEmptyString(_password_hash))
      throw new InvalidStateError(
        validation.message.isNullOrEmptyString("PasswordHash")
      );
    if (validation.isNullOrEmptyString(_salt))
      throw new InvalidStateError(
        validation.message.isNullOrEmptyString("Salt")
      );
  };

  _validate();

  const _touch = () => {
    _last_updated_at = new Date();
  };

  const authSettings: InstanceAuthSettings = {
    getId: () => 1,
    getPasswordHash: () => _password_hash,
    setInstanceCredentials: ({ hash, salt }) => {
      if (validation.isNullOrEmptyString(hash))
        throw new InvalidArgumentError(
          validation.message.isNullOrEmptyString("hash")
        );
      if (validation.isNullOrEmptyString(salt))
        throw new InvalidArgumentError(
          validation.message.isNullOrEmptyString("salt")
        );
      _password_hash = hash;
      _salt = salt;
      _touch();
      _validate();
    },
    getSalt: () => _salt,
    getCreatedAt: () => _created_at,
    getLastUpdatedAt: () => _last_updated_at,
    validate: _validate,
  };
  return Object.freeze(authSettings);
};

export const makeInstanceAuthSettings = (
  props: MakeInstanceAuthSettingsProps
): InstanceAuthSettings => {
  return buildInstanceAuthSettings(props);
};

export const rehydrateInstanceAuthSettings = (
  props: RehydrateInstanceAuthSettingsProps
): InstanceAuthSettings => {
  return buildInstanceAuthSettings(props);
};
