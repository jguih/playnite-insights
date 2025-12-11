import type { EntityMapper } from "@playatlas/common/application";
import {
  rehydrateExtensionRegistration,
  type ExtensionRegistration,
} from "./domain/extension-registration.entity";
import type { ExtensionRegistrationResponseDto } from "./dtos/extension-registration.response";
import type { ExtensionRegistrationModel } from "./infra/extension-registration.repository";

export type ExtensionRegistrationMapper = Omit<
  EntityMapper<ExtensionRegistration, ExtensionRegistrationModel>,
  "toPersistence"
> & {
  toPersistence: (
    entity: ExtensionRegistration,
    options?: {
      id?: number;
    }
  ) => ExtensionRegistrationModel;
  toDto: (entity: ExtensionRegistration) => ExtensionRegistrationResponseDto;
  toDtoList: (
    entity: ExtensionRegistration[]
  ) => ExtensionRegistrationResponseDto[];
};

const _toDto: ExtensionRegistrationMapper["toDto"] = (entity) => {
  const dto: ExtensionRegistrationResponseDto = {
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
  return dto;
};

export const extensionRegistrationMapper: ExtensionRegistrationMapper = {
  toDomain: (model) => {
    const entity = rehydrateExtensionRegistration({
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
  toPersistence: (entity, options = {}) => {
    const model: ExtensionRegistrationModel = {
      Id: options.id ?? -1,
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
  toDto: _toDto,
  toDtoList: (entity) => {
    const dtos: ExtensionRegistrationResponseDto[] = [];
    for (const registration of entity) dtos.push(_toDto(registration));
    return dtos;
  },
};
