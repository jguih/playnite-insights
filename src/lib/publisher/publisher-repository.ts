import { getDb } from '$lib/infrastructure/database';
import z from 'zod';
import { logError, logSuccess } from '../services/log';
import { publisherSchema, type Publisher } from './schemas';

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

export const updatePublisher = (publisher: Publisher): boolean => {
	const db = getDb();
	const query = `
    UPDATE publisher
    SET
      Name = ?
    WHERE Id = ?;
  `;
	try {
		const stmt = db.prepare(query);
		stmt.run(publisher.Name, publisher.Id);
		logSuccess(`Updated data for publisher ${publisher.Name}`);
		return true;
	} catch (error) {
		logError(`Failed to update publisher ${publisher.Name}`, error as Error);
		return false;
	}
};

export const getPublisherById = (id: string): Publisher | undefined => {
	const db = getDb();
	const query = `
    SELECT *
    FROM publisher
    WHERE Id = ?;
  `;
	try {
		const stmt = db.prepare(query);
		const result = stmt.get(id);
		const dev = z.optional(publisherSchema).parse(result);
		return dev;
	} catch (error) {
		logError(`Failed to get publisher with if ${id}`, error as Error);
		return;
	}
};

export const publisherHasChanges = (oldPublisher: Publisher, newPublisher: Publisher): boolean => {
	return oldPublisher.Id != newPublisher.Id || oldPublisher.Name != newPublisher.Name;
};
