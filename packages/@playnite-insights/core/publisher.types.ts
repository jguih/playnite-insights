import type { Publisher } from "@playnite-insights/lib";

export type PublisherRepository = {
  add: (publisher: Publisher) => boolean;
  exists: (publisher: Publisher) => boolean;
  update: (publisher: Publisher) => boolean;
  getById: (id: string) => Publisher | undefined;
  hasChanges: (oldPublisher: Publisher, newPublisher: Publisher) => boolean;
  all: () => Publisher[] | undefined;
};
