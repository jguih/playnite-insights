import type { PlatformResponseDto } from "../../dtos/platform.response.dto";
import type { PlatformRepository } from "../../infra/platform.repository.port";

export type GetAllPlatformsQueryHandlerDeps = {
  platformRepository: PlatformRepository;
};

export type GetAllPlatformsQueryResult =
  | { type: "not_modified" }
  | { type: "ok"; data: PlatformResponseDto[]; etag: string };
