import { GenreResponseDto } from "../../dtos/genre.response.dto";
import { GenreRepository } from "../../infra/genre.repository.port";

export type GetAllGenresQueryHandlerDeps = {
  genreRepository: GenreRepository;
};

export type GetAllGenresQueryResult =
  | { type: "not_modified" }
  | { type: "ok"; data: GenreResponseDto[]; etag: string };
