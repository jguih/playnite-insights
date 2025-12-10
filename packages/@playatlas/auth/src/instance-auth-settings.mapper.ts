import { EntityMapper } from "@playatlas/common/application";
import {
  InstanceAuthSettings,
  rehydrateInstanceAuthSettings,
} from "./domain/instance-auth-settings.entity";
import { InstanceAuthSettingsModel } from "./infra/instance-auth-settings.repository";

export const instanceAuthSettingsMapper: EntityMapper<
  InstanceAuthSettings,
  InstanceAuthSettingsModel
> = {
  toPersistence: (entity) => {
    const model: InstanceAuthSettingsModel = {
      Id: entity.getId(),
      PasswordHash: entity.getPasswordHash(),
      Salt: entity.getSalt(),
      CreatedAt: entity.getCreatedAt().toISOString(),
      LastUpdatedAt: entity.getLastUpdatedAt().toISOString(),
    };
    return model;
  },
  toDomain: (model) => {
    const entity = rehydrateInstanceAuthSettings({
      passwordHash: model.PasswordHash,
      salt: model.Salt,
      createdAt: new Date(model.CreatedAt),
      lastUpdatedAt: new Date(model.LastUpdatedAt),
    });
    return entity;
  },
};
