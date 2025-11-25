import { faker } from "@faker-js/faker";
import { makeGenre } from "../domain/genre.entity";
import { MakeGenreProps } from "../domain/genre.entity.types";

export const makeGenreFactory = () => {
  const buildGenre = (props: Partial<MakeGenreProps> = {}) => {
    return makeGenre({
      id: props.id ?? faker.string.uuid(),
      name: props.name ?? faker.lorem.words({ min: 1, max: 2 }),
    });
  };

  const buildGenreList = (n: number, props: Partial<MakeGenreProps> = {}) => {
    return Array.from({ length: n }, () => buildGenre(props));
  };

  return { buildGenre, buildGenreList };
};
