import { faker } from "@faker-js/faker";
import { type Genre, makeGenre } from "../domain/genre.entity";
import { MakeGenreProps } from "../domain/genre.entity.types";

export type GenreFactory = {
  buildGenre: (props?: Partial<MakeGenreProps>) => Genre;
  buildGenreList: (n: number, props?: Partial<MakeGenreProps>) => Genre[];
};

export const makeGenreFactory = (): GenreFactory => {
  const buildGenre: GenreFactory["buildGenre"] = (props = {}) => {
    return makeGenre({
      id: props.id ?? faker.string.uuid(),
      name: props.name ?? faker.lorem.words({ min: 1, max: 2 }),
    });
  };

  const buildGenreList: GenreFactory["buildGenreList"] = (n, props = {}) => {
    return Array.from({ length: n }, () => buildGenre(props));
  };

  return { buildGenre, buildGenreList };
};
