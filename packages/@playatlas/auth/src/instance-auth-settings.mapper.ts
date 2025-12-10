import { EntityMapper } from "@playatlas/common/application";
import { InstanceAuthSettings } from "./domain/instance-auth-settings.entity";
import { InstanceAuthSettingsModel } from "./infra/instance-auth-settings.repository";

export const instanceAuthSettingsMapper: EntityMapper<
  InstanceAuthSettings,
  InstanceAuthSettingsModel
> = {
  toPersistence: (entity) => {
    throw new Error("Function not implemented.");
  },
  toDomain: (model) => {
    throw new Error("Function not implemented.");
  },
};
