import { Genre, GenreId } from "../domain/genre.entity";

export type GenreRepository = {
  add: (genre: Genre) => void;
  exists: (id: GenreId) => boolean;
  update: (genre: Genre) => void;
  getById: (id: GenreId) => Genre | null;
  all: () => Genre[];
  upsertMany: (genres: Genre[]) => void;
};
