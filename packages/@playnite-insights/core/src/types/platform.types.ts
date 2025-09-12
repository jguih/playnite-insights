import type { Platform } from "@playnite-insights/lib/client";

export type PlatformRepository = {
  add: (platform: Platform) => boolean;
  exists: (platform: Pick<Platform, "Id" | "Name">) => boolean;
  update: (platform: Platform) => boolean;
  getById: (id: string) => Platform | undefined;
  hasChanges: (oldPlatform: Platform, newPlatform: Platform) => boolean;
  all: () => Platform[] | undefined;
};
