import { getDb } from '$lib/infrastructure/database';
import { developerSchema, type Developer } from '$lib/developer/schemas';
import { logError, logSuccess } from '../log/log';
import z from 'zod';

export const addDeveloper = (developer: Developer): boolean => {
	const db = getDb();
	const query = `
    INSERT INTO developer
      (Id, Name)
    VALUES
      (?, ?);
  `;
	try {
		const stmt = db.prepare(query);
		stmt.run(developer.Id, developer.Name);
		logSuccess(`Added developer ${developer.Name}`);
		return true;
	} catch (error) {
		logError(`Failed to add developer ${developer.Name}`, error as Error);
		return false;
	}
};

export const developerExists = (developer: Developer): boolean => {
	const db = getDb();
	const query = `
    SELECT EXISTS (
      SELECT 1 FROM developer 
      WHERE Id = (?)
    );
  `;
	try {
		const stmt = db.prepare(query);
		const result = stmt.get(developer.Id);
		if (result) {
			return Object.values(result)[0] === 1;
		}
		return false;
	} catch (error) {
		logError(`Failed to check if developer ${developer.Name} exists`, error as Error);
		return false;
	}
};

export const updateDeveloper = (developer: Developer): boolean => {
	const db = getDb();
	const query = `
    UPDATE developer
    SET
      Name = ?
    WHERE Id = ?;
  `;
	try {
		const stmt = db.prepare(query);
		stmt.run(developer.Name, developer.Id);
		logSuccess(`Updated data for developer ${developer.Name}`);
		return true;
	} catch (error) {
		logError(`Failed to update developer ${developer.Name}`, error as Error);
		return false;
	}
};

export const getDeveloperById = (id: string): Developer | undefined => {
	const db = getDb();
	const query = `
    SELECT *
    FROM developer
    WHERE Id = ?;
  `;
	try {
		const stmt = db.prepare(query);
		const result = stmt.get(id);
		const dev = z.optional(developerSchema).parse(result);
		return dev;
	} catch (error) {
		logError(`Failed to get developer with if ${id}`, error as Error);
		return;
	}
};

export const developerHasChanges = (oldDev: Developer, newDev: Developer): boolean => {
	return oldDev.Id != newDev.Id || oldDev.Name != newDev.Name;
};
