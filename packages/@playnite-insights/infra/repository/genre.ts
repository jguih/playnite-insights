import z from "zod";
import type { DatabaseSync } from "node:sqlite";
import type { GenreRepository, LogService } from "@playnite-insights/core";
import { type Genre, genreSchema } from "@playnite-insights/lib";
import { getDb as _getDb } from "../database";
import { defaultLogger } from "../services/log";

type GenreRepositoryDeps = {
  logService: LogService;
  getDb: () => DatabaseSync;
};

export const makeGenreRepository = (
  { logService, getDb }: GenreRepositoryDeps = {
    getDb: _getDb,
    logService: defaultLogger,
  }
): GenreRepository => {
  const add = (genre: Genre): boolean => {
    const db = getDb();
    const query = `
    INSERT INTO genre
      (Id, Name)
    VALUES
      (?, ?)
  `;
    try {
      const stmt = db.prepare(query);
      stmt.run(genre.Id, genre.Name);
      logService.debug(`Added genre ${genre.Name}`);
      return true;
    } catch (error) {
      logService.error(`Failed to add genre ${genre.Name}`, error as Error);
      return false;
    }
  };

  const exists = (genre: Genre): boolean => {
    const db = getDb();
    const query = `
    SELECT EXISTS (
      SELECT 1 FROM genre 
      WHERE Id = (?)
    )
  `;
    try {
      const stmt = db.prepare(query);
      const result = stmt.get(genre.Id);
      if (result) {
        return Object.values(result)[0] === 1;
      }
      return false;
    } catch (error) {
      logService.error(
        `Failed to check if genre ${genre.Name} exists`,
        error as Error
      );
      return false;
    }
  };

  const update = (genre: Genre): boolean => {
    const db = getDb();
    const query = `
    UPDATE genre
    SET
      Name = ?
    WHERE Id = ?;
  `;
    try {
      const stmt = db.prepare(query);
      stmt.run(genre.Name, genre.Id);
      logService.debug(`Updated data for genre ${genre.Name}`);
      return true;
    } catch (error) {
      logService.error(`Failed to update genre ${genre.Name}`, error as Error);
      return false;
    }
  };

  const getById = (id: string): Genre | undefined => {
    const db = getDb();
    const query = `
    SELECT *
    FROM genre
    WHERE Id = ?;
  `;
    try {
      const stmt = db.prepare(query);
      const result = stmt.get(id);
      const genre = z.optional(genreSchema).parse(result);
      logService.debug(`Found genre: ${genre?.Name}`);
      return genre;
    } catch (error) {
      logService.error(`Failed to get genre with if ${id}`, error as Error);
      return;
    }
  };

  const hasChanges = (oldGenre: Genre, newGenre: Genre): boolean => {
    return oldGenre.Id != newGenre.Id || oldGenre.Name != newGenre.Name;
  };

  const all: GenreRepository["all"] = () => {
    const db = getDb();
    const query = `SELECT * FROM genre ORDER BY Name ASC`;
    try {
      const stmt = db.prepare(query);
      const result = stmt.all();
      const genres = z.optional(z.array(genreSchema)).parse(result);
      logService.debug(`Found ${genres.length} genres`);
      return genres;
    } catch (error) {
      logService.error(`Failed to get genre list`, error as Error);
    }
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
