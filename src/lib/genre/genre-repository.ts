import { getDb } from '$lib/infrastructure/database';
import { genreSchema, type Genre } from '$lib/genre/schemas';
import { logError, logSuccess } from '../log/log';
import z from 'zod';

export const addGenre = (genre: Genre): boolean => {
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
		logSuccess(`Added genre ${genre.Name}`);
		return true;
	} catch (error) {
		logError(`Failed to add genre ${genre.Name}`, error as Error);
		return false;
	}
};

export const genreExists = (genre: Genre): boolean => {
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
		logError(`Failed to check if genre ${genre.Name} exists`, error as Error);
		return false;
	}
};

export const updateGenre = (genre: Genre): boolean => {
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
		logSuccess(`Updated data for genre ${genre.Name}`);
		return true;
	} catch (error) {
		logError(`Failed to update genre ${genre.Name}`, error as Error);
		return false;
	}
};

export const getGenreById = (id: string): Genre | undefined => {
	const db = getDb();
	const query = `
    SELECT *
    FROM genre
    WHERE Id = ?;
  `;
	try {
		const stmt = db.prepare(query);
		const result = stmt.get(id);
		const dev = z.optional(genreSchema).parse(result);
		return dev;
	} catch (error) {
		logError(`Failed to get genre with if ${id}`, error as Error);
		return;
	}
};

export const genreHasChanges = (oldGenre: Genre, newGenre: Genre): boolean => {
	return oldGenre.Id != newGenre.Id || oldGenre.Name != newGenre.Name;
};
