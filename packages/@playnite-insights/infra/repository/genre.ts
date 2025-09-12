import type { GenreRepository } from "@playnite-insights/core";
import { type Genre, genreSchema } from "@playnite-insights/lib/client";
import z from "zod";
import {
  BaseRepositoryDeps,
  defaultRepositoryDeps,
  repositoryCall,
} from "./base";

export const makeGenreRepository = (
  deps: Partial<BaseRepositoryDeps> = {}
): GenreRepository => {
  const { getDb, logService } = { ...defaultRepositoryDeps, ...deps };

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
        logService.debug(`Added genre ${genre.Name}`);
        return true;
      },
      `add(${genre.Id}, ${genre.Name})`
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
        logService.debug(`Updated data for genre ${genre.Name}`);
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
  };
};

export const defaultGenreRepository: GenreRepository = makeGenreRepository();
