import { QueryHandler } from "@playatlas/common/common";
import { createHashForObject } from "@playatlas/common/infra";
import { gameMapper } from "../../game.mapper";
import { GetAllGamesQuery } from "./get-all-games.query";
import {
  GetAllGamesQueryHandlerDeps,
  GetAllGamesQueryResult,
} from "./get-all-games.query.types";

export type GetAllGamesQueryHandler = QueryHandler<
  GetAllGamesQuery,
  GetAllGamesQueryResult
>;

export const makeGetAllGamesQueryHandler = ({
  gameRepository,
}: GetAllGamesQueryHandlerDeps): GetAllGamesQueryHandler => {
  return {
    execute: ({ ifNoneMatch } = {}) => {
      const games = gameRepository.all({ load: true });

      if (!games || games.length === 0) {
        return { type: "ok", data: [], etag: '"empty"' };
      }

      const gameDtos = gameMapper.toDtoList(games);
      const hash = createHashForObject(gameDtos);
      const etag = `"${hash}"`;

      if (ifNoneMatch === etag) {
        return { type: "not_modified" };
      }

      return { type: "ok", data: gameDtos, etag };
    },
  };
};
