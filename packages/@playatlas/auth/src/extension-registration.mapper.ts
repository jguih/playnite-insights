import type { EntityMapper } from "@playatlas/common/application";
import {
  makeExtensionRegistration,
  type ExtensionRegistration,
} from "./domain/extension-registration.entity";
import type { ExtensionRegistrationModel } from "./infra/extension-registration.repository";

export const extensionRegistrationMapper: EntityMapper<
  ExtensionRegistration,
  ExtensionRegistrationModel
> = {
  toDomain: (model) => {
    const entity = makeExtensionRegistration({
      id: model.Id,
      extensionId: model.ExtensionId,
      extensionVersion: model.ExtensionVersion,
      hostname: model.Hostname,
      os: model.Os,
      publicKey: model.PublicKey,
      status: model.Status,
      createdAt: new Date(model.CreatedAt),
      lastUpdatedAt: new Date(model.LastUpdatedAt),
    });
    return entity;
  },
  toPersistence: (entity) => {
    const model: ExtensionRegistrationModel = {
      Id: entity.getId(),
      ExtensionId: entity.getExtensionId(),
      ExtensionVersion: entity.getExtensionVersion(),
      Hostname: entity.getHostname(),
      Os: entity.getOs(),
      PublicKey: entity.getPublicKey(),
      Status: entity.getStatus(),
      CreatedAt: entity.getCreatedAt().toISOString(),
      LastUpdatedAt: entity.getLastUpdatedAt().toISOString(),
    };
    return model;
  },
};
