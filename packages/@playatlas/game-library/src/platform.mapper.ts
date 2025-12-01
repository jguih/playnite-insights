import { type EntityMapper } from "@playatlas/common/application";
import { makePlatform, Platform } from "./domain/platform.entity";
import { PlatformModel } from "./infra/platform.repository";

export const platformMapper: EntityMapper<Platform, PlatformModel> = {
  toPersistence: (entity) => {
    const model: PlatformModel = {
      Id: entity.getId(),
      Name: entity.getName(),
      SpecificationId: entity.getSpecificationId(),
      Background: entity.getBackground(),
      Cover: entity.getCover(),
      Icon: entity.getIcon(),
    };
    return model;
  },
  toDomain: (model) => {
    const entity: Platform = makePlatform({
      id: model.Id,
      name: model.Name,
      specificationId: model.SpecificationId,
      background: model.Background,
      cover: model.Cover,
      icon: model.Icon,
    });
    return entity;
  },
};
