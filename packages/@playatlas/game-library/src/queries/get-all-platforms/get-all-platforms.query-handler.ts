import { QueryHandler } from "@playatlas/common/common";
import { createHashForObject } from "@playatlas/common/infra";
import { platformMapper } from "../../platform.mapper";
import { GetAllPlatformsQuery } from "./get-all-platforms.query";
import {
  GetAllPlatformsQueryHandlerDeps,
  GetAllPlatformsQueryResult,
} from "./get-all-platforms.query.types";

export type GetAllPlatformsQueryHandler = QueryHandler<
  GetAllPlatformsQuery,
  GetAllPlatformsQueryResult
>;

export const makeGetAllPlatformQueryHandler = ({
  platformRepository,
}: GetAllPlatformsQueryHandlerDeps): GetAllPlatformsQueryHandler => {
  return {
    execute: ({ ifNoneMatch } = {}) => {
      const platforms = platformRepository.all();

      if (!platforms || platforms.length === 0) {
        return { type: "ok", data: [], etag: '"empty"' };
      }

      const platformDtos = platformMapper.toDtoList(platforms);
      const hash = createHashForObject(platformDtos);
      const etag = `"${hash}"`;

      if (ifNoneMatch === etag) {
        return { type: "not_modified" };
      }

      return { type: "ok", data: platformDtos, etag };
    },
  };
};
