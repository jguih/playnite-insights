import {
  BaseRepositoryDeps,
  makeRepositoryBase,
} from "@playatlas/common/infra";
import z from "zod";
import { Genre } from "../domain";
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
  const base = makeRepositoryBase({ getDb, logService });

  const add: GenreRepository["add"] = (genre) => {
    return base.run(({ db }) => {
      const query = `
      INSERT INTO genre
        (Id, Name)
      VALUES
        (?, ?)
      `;
      const stmt = db.prepare(query);
      const genreModel = genreMapper.toPersistence(genre);
      stmt.run(genreModel.Id, genreModel.Name);
      logService.debug(`Created genre ${genreModel.Name}`);
      return true;
    }, `add(${genre.getId()}, ${genre.getName()})`);
  };

  const upsertMany: GenreRepository["upsertMany"] = (genres) => {
    return base.run(({ db }) => {
      const query = `
        INSERT INTO genre
          (Id, Name)
        VALUES
          (?, ?)
        ON CONFLICT DO UPDATE SET
          Name = excluded.Name;
        `;
      const stmt = db.prepare(query);
      base.runTransaction(() => {
        for (const genre of genres) {
          const genreModel = genreMapper.toPersistence(genre);
          stmt.run(genreModel.Id, genreModel.Name);
        }
      });
    }, `upsertMany(${genres.length} genres)`);
  };

  const exists: GenreRepository["exists"] = (id) => {
    return base.run(({ db }) => {
      const query = `
        SELECT EXISTS (
          SELECT 1 FROM genre 
          WHERE Id = (?)
        )`;
      const stmt = db.prepare(query);
      const result = stmt.get(id);
      if (result) {
        return Object.values(result)[0] === 1;
      }
      return false;
    }, `exists(${id})`);
  };

  const update: GenreRepository["update"] = (genre) => {
    return base.run(({ db }) => {
      const query = `
        UPDATE genre
        SET
          Name = ?
        WHERE Id = ?;
        `;
      const stmt = db.prepare(query);
      const genreModel = genreMapper.toPersistence(genre);
      stmt.run(genreModel.Name, genreModel.Id);
      logService.debug(`Updated genre ${genreModel.Name}`);
      return true;
    }, `update(${genre.getId()}, ${genre.getName()})`);
  };

  const getById: GenreRepository["getById"] = (id) => {
    return base.run(({ db }) => {
      const query = `SELECT * FROM genre WHERE Id = ?;`;
      const stmt = db.prepare(query);
      const result = stmt.get(id);
      const genreModel = z.optional(genreSchema).parse(result);
      const genre = genreModel ? genreMapper.toDomain(genreModel) : null;
      logService.debug(`Found genre: ${genre?.getName()}`);
      return genre;
    }, `getById(${id})`);
  };

  const all: GenreRepository["all"] = () => {
    return base.run(({ db }) => {
      const query = `SELECT * FROM genre ORDER BY Name ASC`;
      const stmt = db.prepare(query);
      const result = stmt.all();
      const genreModels = z.array(genreSchema).parse(result);
      const genres: Genre[] = [];
      for (const genreModel of genreModels) {
        genres.push(genreMapper.toDomain(genreModel));
      }
      logService.debug(`Found ${genres?.length ?? 0} genres`);
      return genres;
    }, `all()`);
  };

  return {
    add,
    exists,
    update,
    getById,
    all,
    upsertMany,
  };
};
