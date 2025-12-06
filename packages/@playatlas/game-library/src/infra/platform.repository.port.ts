import { BaseEntityRepository } from "@playatlas/common/infra";
import { Platform, PlatformId } from "../domain/platform.entity";

export type PlatformRepository = BaseEntityRepository<
  PlatformId,
  Platform
> & {};
