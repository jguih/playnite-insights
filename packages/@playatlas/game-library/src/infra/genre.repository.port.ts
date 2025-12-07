import { EntityRepository } from "@playatlas/common/infra";
import { Genre, GenreId } from "../domain/genre.entity";

export type GenreRepository = EntityRepository<GenreId, Genre> & {};
