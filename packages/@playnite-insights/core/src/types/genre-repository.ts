import type { Genre } from "@playatlas/game-library/core";

export type GenreRepository = {
  add: (genre: Genre) => boolean;
  exists: (genre: Genre) => boolean;
  update: (genre: Genre) => boolean;
  getById: (id: string) => Genre | undefined;
  hasChanges: (oldGenre: Genre, newGenre: Genre) => boolean;
  all: () => Genre[] | undefined;
  upsertMany: (genres: Genre[]) => void;
};
