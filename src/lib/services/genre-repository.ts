import { getDb } from '$lib/infrastructure/database';
import type { Genre } from '$lib/models/genre';
import { logError, logSuccess } from './log';

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
