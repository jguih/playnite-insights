import { getDb } from '$lib/infrastructure/database';
import type { Developer } from '$lib/models/developer';
import { logError, logSuccess } from './log';

export const addDeveloper = (developer: Developer): boolean => {
	const db = getDb();
	const query = `
    INSERT INTO developer
      (Id, Name)
    VALUES
      (?, ?)
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
    )
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
