import type { QueryHandler } from "@playatlas/common/common";
import { createHashForObject } from "@playatlas/common/infra";
import { genreMapper } from "../../genre.mapper";
import type { GetAllGenresQuery } from "./get-all-genres.query";
import type {
  GetAllGenresQueryHandlerDeps,
  GetAllGenresQueryResult,
} from "./get-all-genres.query.types";

export type GetAllGenresQueryHandler = QueryHandler<
  GetAllGenresQuery,
  GetAllGenresQueryResult
>;

export const makeGetAllGenresQueryHandler = ({
  genreRepository,
}: GetAllGenresQueryHandlerDeps): GetAllGenresQueryHandler => {
  return {
    execute: ({ ifNoneMatch } = {}) => {
      const genres = genreRepository.all();

      if (!genres || genres.length === 0) {
        return { type: "ok", data: [], etag: '"empty"' };
      }

      const genreDtos = genreMapper.toDtoList(genres);
      const hash = createHashForObject(genreDtos);
      const etag = `"${hash}"`;

      if (ifNoneMatch === etag) {
        return { type: "not_modified" };
      }

      return { type: "ok", data: genreDtos, etag };
    },
  };
};
