import { Developer } from "@playnite-insights/lib";

export type DeveloperRepository = {
  add: (platform: Developer) => boolean;
  exists: (developer: Pick<Developer, "Id" | "Name">) => boolean;
  update: (platform: Developer) => boolean;
  getById: (id: string) => Developer | undefined;
  hasChanges: (oldDeveloper: Developer, newDeveloper: Developer) => boolean;
};
