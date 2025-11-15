import { type Genre, genreSchema } from "@playatlas/game-library/src/domain";
import { repositoryCall } from "@playatlas/shared/app";
import { type BaseRepositoryDeps } from "@playatlas/shared/core";
import z from "zod";
import type { GenreRepository } from "../../domain/types/repository/genre";

export const makeGenreRepository = ({
  getDb,
  logService,
}: BaseRepositoryDeps): GenreRepository => {
  const add = (genre: Genre): boolean => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
      INSERT INTO genre
        (Id, Name)
      VALUES
        (?, ?)
      `;
        const stmt = db.prepare(query);
        stmt.run(genre.Id, genre.Name);
        logService.debug(`Created genre ${genre.Name}`);
        return true;
      },
      `add(${genre.Id}, ${genre.Name})`
    );
  };

  const upsertMany: GenreRepository["upsertMany"] = (genres) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
        INSERT INTO genre
          (Id, Name)
        VALUES
          (?, ?)
        ON CONFLICT DO UPDATE SET
          Name = excluded.Name;
        `;
        const stmt = db.prepare(query);
        db.exec("BEGIN TRANSACTION");
        try {
          for (const genre of genres) stmt.run(genre.Id, genre.Name);
          db.exec("COMMIT");
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
      },
      `upsertMany(${genres.length} genres)`
    );
  };

  const exists = (genre: Genre): boolean => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
        SELECT EXISTS (
          SELECT 1 FROM genre 
          WHERE Id = (?)
        )`;
        const stmt = db.prepare(query);
        const result = stmt.get(genre.Id);
        if (result) {
          return Object.values(result)[0] === 1;
        }
        return false;
      },
      `exists(${genre.Id})`
    );
  };

  const update = (genre: Genre): boolean => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
        UPDATE genre
        SET
          Name = ?
        WHERE Id = ?;
        `;
        const stmt = db.prepare(query);
        stmt.run(genre.Name, genre.Id);
        logService.debug(`Updated genre ${genre.Name}`);
        return true;
      },
      `update(${genre.Id}, ${genre.Name})`
    );
  };

  const getById = (id: string): Genre | undefined => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
      SELECT *
      FROM genre
      WHERE Id = ?;
    `;
        const stmt = db.prepare(query);
        const result = stmt.get(id);
        const genre = z.optional(genreSchema).parse(result);
        logService.debug(`Found genre: ${genre?.Name}`);
        return genre;
      },
      `getById(${id})`
    );
  };

  const hasChanges = (oldGenre: Genre, newGenre: Genre): boolean => {
    return oldGenre.Id != newGenre.Id || oldGenre.Name != newGenre.Name;
  };

  const all: GenreRepository["all"] = () => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `SELECT * FROM genre ORDER BY Name ASC`;
        const stmt = db.prepare(query);
        const result = stmt.all();
        const genres = z.optional(z.array(genreSchema)).parse(result);
        logService.debug(`Found ${genres?.length ?? 0} genres`);
        return genres;
      },
      `all()`
    );
  };

  return {
    add,
    exists,
    update,
    getById,
    hasChanges,
    all,
    upsertMany,
  };
};
