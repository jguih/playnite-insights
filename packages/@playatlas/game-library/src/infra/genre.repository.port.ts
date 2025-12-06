import { BaseEntityRepository } from "@playatlas/common/infra";
import { Genre, GenreId } from "../domain/genre.entity";

export type GenreRepository = BaseEntityRepository<GenreId, Genre> & {};
