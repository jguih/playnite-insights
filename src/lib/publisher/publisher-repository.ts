import { getDb } from '$lib/infrastructure/database';
import { logError, logSuccess } from '../log/log';
import type { Publisher } from './schemas';

export const addPublisher = (publisher: Publisher): boolean => {
	const db = getDb();
	const query = `
    INSERT INTO publisher
      (Id, Name)
    VALUES
      (?, ?)
  `;
	try {
		const stmt = db.prepare(query);
		stmt.run(publisher.Id, publisher.Name);
		logSuccess(`Added publisher ${publisher.Name}`);
		return true;
	} catch (error) {
		logError(`Failed to add publisher ${publisher.Name}`, error as Error);
		return false;
	}
};

export const publisherExists = (publisher: Publisher): boolean => {
	const db = getDb();
	const query = `
    SELECT EXISTS (
      SELECT 1 FROM publisher 
      WHERE Id = (?)
    )
  `;
	try {
		const stmt = db.prepare(query);
		const result = stmt.get(publisher.Id);
		if (result) {
			return Object.values(result)[0] === 1;
		}
		return false;
	} catch (error) {
		logError(`Failed to check if publisher ${publisher.Name} exists`, error as Error);
		return false;
	}
};
