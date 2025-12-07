import { EntityRepository } from "@playatlas/common/infra";
import { Platform, PlatformId } from "../domain/platform.entity";

export type PlatformRepository = EntityRepository<PlatformId, Platform> & {};
