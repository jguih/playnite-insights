import { Platform, PlatformId } from "../domain/platform.entity";

export type PlatformRepository = {
  add: (platform: Platform) => void;
  exists: (id: PlatformId) => boolean;
  update: (platform: Platform) => void;
  getById: (id: PlatformId) => Platform | null;
  all: () => Platform[];
  upsertMany: (platforms: Platform[]) => void;
};
