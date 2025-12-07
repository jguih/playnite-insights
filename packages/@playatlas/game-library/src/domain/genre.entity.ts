import { BaseEntity } from "@playatlas/common/domain";
import { MakeGenreProps } from "./genre.entity.types";

export type GenreId = string;
export type GenreName = string;

export type Genre = BaseEntity<GenreId> &
  Readonly<{
    getName: () => GenreName;
  }>;

export const makeGenre = (props: MakeGenreProps): Genre => {
  const _id: GenreId = props.id;
  const _name: GenreName = props.name;

  const genre: Genre = {
    getId: () => _id,
    getName: () => _name,
    validate: () => {},
  };
  return Object.freeze(genre);
};
