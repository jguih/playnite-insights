import {
  BaseRepositoryDeps,
  makeBaseRepository,
} from "@playatlas/common/infra";
import z from "zod";
import { genreMapper } from "../genre.mapper";
import { GenreRepository } from "./genre.repository.port";

export const genreSchema = z.object({
  Id: z.string(),
  Name: z.string(),
});

export type GenreModel = z.infer<typeof genreSchema>;

export const makeGenreRepository = ({
  getDb,
  logService,
}: BaseRepositoryDeps): GenreRepository => {
  const TABLE_NAME = "genre";
  const COLUMNS: (keyof GenreModel)[] = ["Id", "Name"];
  const base = makeBaseRepository({
    getDb,
    logService,
    config: {
      tableName: TABLE_NAME,
      idColumn: "Id",
      insertColumns: COLUMNS,
      updateColumns: COLUMNS.filter((c) => c !== "Id"),
      mapper: genreMapper,
      modelSchema: genreSchema,
    },
  });

  const add: GenreRepository["add"] = (genre) => base.add(genre);

  const upsert: GenreRepository["upsert"] = (genre) => base.upsert(genre);

  const exists: GenreRepository["exists"] = (id) => base.exists(id);

  const update: GenreRepository["update"] = (genre) => base.update(genre);

  const getById: GenreRepository["getById"] = (id) => base.getById(id);

  const all: GenreRepository["all"] = () => base.all();

  const remove: GenreRepository["remove"] = (id) => base.remove(id);

  return {
    add,
    exists,
    update,
    getById,
    all,
    upsert,
    remove,
  };
};
