import { type Genre } from "@playnite-insights/lib";

export type GenreRepository = {
  add: (genre: Genre) => boolean;
  exists: (genre: Genre) => boolean;
  update: (genre: Genre) => boolean;
  getById: (id: string) => Genre | undefined;
  hasChanges: (oldGenre: Genre, newGenre: Genre) => boolean;
};
