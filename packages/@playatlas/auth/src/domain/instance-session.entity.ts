import { validation } from "@playatlas/common/application";
import {
  BaseEntity,
  InvalidArgumentError,
  InvalidStateError,
} from "@playatlas/common/domain";
import { buildInstanceSessionPropsSchema } from "./instance-session.entity.schemas";
import {
  BuildInstanceSessionProps,
  MakeInstanceSessionProps,
  RehydrateInstanceSessionProps,
} from "./instance-session.entity.types";

export type InstanceSessionId = string;
export type InstanceSession = BaseEntity<InstanceSessionId> &
  Readonly<{
    getCreatedAt: () => Date;
    getLastUsedAt: () => Date;
  }>;

const buildInstanceSession = (
  props: BuildInstanceSessionProps
): InstanceSession => {
  const result = buildInstanceSessionPropsSchema.safeParse(props);
  if (!result.success)
    throw new InvalidArgumentError(
      `Invalid props passed to entity factory: ${result.error.message}`
    );

  const now = new Date();
  const _session_id = props.sessionId;
  const _created_at = props.createdAt ?? now;
  let _last_used_at = props.lastUsedAt ?? now;

  const _validate = () => {
    if (validation.isNullOrEmptyString(_session_id))
      throw new InvalidStateError(
        validation.message.isNullOrEmptyString("Session Id")
      );
  };

  _validate();

  const session: InstanceSession = {
    getId: () => _session_id,
    getSafeId: () => "<redacted>",
    getCreatedAt: () => _created_at,
    getLastUsedAt: () => _last_used_at,
    validate: _validate,
  };
  return Object.freeze(session);
};

export const makeInstanceSession = (props: MakeInstanceSessionProps) => {
  return buildInstanceSession(props);
};

export const rehydrateInstanceSession = (
  props: RehydrateInstanceSessionProps
) => {
  return buildInstanceSession(props);
};
