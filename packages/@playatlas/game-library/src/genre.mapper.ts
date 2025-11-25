import { EntityMapper } from "@playatlas/common/domain";
import { Genre, makeGenre } from "./domain/genre.entity";
import { GenreModel } from "./infra/genre.repository";

export const genreMapper: EntityMapper<Genre, GenreModel> = {
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
};
