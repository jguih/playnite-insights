import { type EntityMapper } from "@playatlas/common/application";
import { makePlatform, Platform } from "./domain/platform.entity";
import { PlatformResponseDto } from "./dtos";
import { PlatformModel } from "./infra/platform.repository";

export type PlatformMapper = EntityMapper<
  Platform,
  PlatformModel,
  PlatformResponseDto
>;

const _toDto: PlatformMapper["toDto"] = (entity) => {
  const dto: PlatformResponseDto = {
    Id: entity.getId(),
    Background: entity.getBackground(),
    Cover: entity.getCover(),
    Icon: entity.getIcon(),
    Name: entity.getName(),
    SpecificationId: entity.getSpecificationId(),
  };
  return dto;
};

export const platformMapper: PlatformMapper = {
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
  toDto: _toDto,
  toDtoList: (entities) => {
    const dtos: PlatformResponseDto[] = [];
    for (const entity of entities) dtos.push(_toDto(entity));
    return dtos;
  },
};
