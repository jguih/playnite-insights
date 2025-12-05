import type { EntityMapper } from "@playatlas/common/application";
import {
  makeExtensionRegistration,
  type ExtensionRegistration,
} from "./domain/extension-registration.entity";
import type {
  ExtensionRegistrationModel,
  ExtensionRegistrationModelInsert,
} from "./infra/extension-registration.repository";

export type ExtensionRegistrationMapper = Omit<
  EntityMapper<ExtensionRegistration, ExtensionRegistrationModel>,
  "toPersistence"
> & {
  toPersistence: (props: {
    entity: ExtensionRegistration;
    createdAt: Date;
    lastUpdatedAt: Date;
  }) => ExtensionRegistrationModelInsert;
};

export const extensionRegistrationMapper: ExtensionRegistrationMapper = {
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
  toPersistence: ({ entity, createdAt, lastUpdatedAt }) => {
    const model: ExtensionRegistrationModelInsert = {
      ExtensionId: entity.getExtensionId(),
      ExtensionVersion: entity.getExtensionVersion(),
      Hostname: entity.getHostname(),
      Os: entity.getOs(),
      PublicKey: entity.getPublicKey(),
      Status: entity.getStatus(),
      CreatedAt: createdAt.toISOString(),
      LastUpdatedAt: lastUpdatedAt.toISOString(),
    };
    return model;
  },
};
