import { QueryHandler } from "@playatlas/common/common";
import { createHashForObject } from "@playatlas/common/infra";
import { gameMapper } from "../../game.mapper";
import {
  GetAllGamesQueryHandlerDeps,
  GetAllGamesResult,
} from "./get-all-games.query.types";
import { GetAllGamesQuery } from "./get-all-games.request.dto";

export type GetAllGamesQueryHandler = QueryHandler<
  GetAllGamesQuery,
  GetAllGamesResult
>;

export const makeGetAllGamesQueryHandler = ({
  gameRepository,
}: GetAllGamesQueryHandlerDeps): GetAllGamesQueryHandler => {
  return {
    execute: ({ ifNoneMatch }) => {
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
