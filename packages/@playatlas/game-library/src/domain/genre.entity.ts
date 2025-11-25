import { MakeGenreProps } from "./genre.entity.types";

export type GenreId = string;
export type GenreName = string;

export type Genre = Readonly<{
  getId: () => GenreId;
  getName: () => GenreName;
}>;

export const makeGenre = (props: MakeGenreProps): Genre => {
  const _id: GenreId = props.id;
  const _name: GenreName = props.name;

  const genre = {
    getId: () => _id,
    getName: () => _name,
  };
  return Object.freeze(genre);
};
