import { type EntityMapper } from "@playatlas/common/application";
import { Genre, makeGenre } from "./domain/genre.entity";
import { GenreResponseDto } from "./dtos";
import { GenreModel } from "./infra/genre.repository";

export type GenreMapper = EntityMapper<Genre, GenreModel, GenreResponseDto>;

const _toDto: GenreMapper["toDto"] = (entity) => {
  const dto: GenreResponseDto = {
    Id: entity.getId(),
    Name: entity.getName(),
  };
  return dto;
};

export const genreMapper: GenreMapper = {
  toPersistence: (entity) => {
    const model: GenreModel = {
      Id: entity.getId(),
      Name: entity.getName(),
    };
    return model;
  },
  toDomain: (model) => {
    const entity: Genre = makeGenre({ id: model.Id, name: model.Name });
    return entity;
  },
  toDto: _toDto,
  toDtoList: (entities) => {
    const dtos: GenreResponseDto[] = [];
    for (const entity of entities) dtos.push(_toDto(entity));
    return dtos;
  },
};
