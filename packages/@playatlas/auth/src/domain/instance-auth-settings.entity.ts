import { validation } from "@playatlas/common/application";
import { BaseEntity, InvalidStateError } from "@playatlas/common/domain";
import {
  BuildInstanceAuthSettingsProps,
  MakeInstanceAuthSettingsProps,
  RehydrateInstanceAuthSettingsProps,
} from "./instance-auth-settings.entity.types";

export type InstanceAuthSettingsId = 1;
export type InstanceAuthSettings = BaseEntity<InstanceAuthSettingsId> &
  Readonly<{
    getPasswordHash: () => string;
    getSalt: () => string;
    getCreatedAt: () => Date;
    getLastUpdatedAt: () => Date;
  }>;

const buildInstanceAuthSettings = (
  props: BuildInstanceAuthSettingsProps
): InstanceAuthSettings => {
  const now = new Date();
  const _password_hash = props.passwordHash;
  const _salt = props.salt;
  const _created_at = props.createdAt ?? now;
  const _last_updated_at = props.lastUpdatedAt ?? now;

  const authSettings: InstanceAuthSettings = {
    getId: () => 1,
    getPasswordHash: () => _password_hash,
    getSalt: () => _salt,
    getCreatedAt: () => _created_at,
    getLastUpdatedAt: () => _last_updated_at,
    validate: () => {
      if (validation.isNullOrNonEmptyString(_password_hash))
        throw new InvalidStateError("Password Hash must not be empty or null");
      if (validation.isNullOrNonEmptyString(_salt))
        throw new InvalidStateError("Salt must not be empty or null");
    },
  };
  return Object.freeze(authSettings);
};

export const makeInstanceAuthSettings = (
  props: MakeInstanceAuthSettingsProps
) => {
  return buildInstanceAuthSettings(props);
};

export const rehydrateInstanceAuthSettings = (
  props: RehydrateInstanceAuthSettingsProps
) => {
  return buildInstanceAuthSettings(props);
};
