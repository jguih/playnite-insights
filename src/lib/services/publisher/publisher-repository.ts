import z from 'zod';
import { publisherSchema, type Publisher } from './schemas';
import type { DatabaseSync } from 'node:sqlite';
import type { LogService } from '$lib/services/log';

type PublisherRepositoryDeps = {
	getDb: () => DatabaseSync;
	logService: LogService;
};

export type PublisherRepository = {
	add: (publisher: Publisher) => boolean;
	exists: (publisher: Publisher) => boolean;
	update: (publisher: Publisher) => boolean;
	getById: (id: string) => Publisher | undefined;
	hasChanges: (oldPublisher: Publisher, newPublisher: Publisher) => boolean;
};

export const makePublisherRepository = (deps: PublisherRepositoryDeps): PublisherRepository => {
	const add = (publisher: Publisher): boolean => {
		const db = deps.getDb();
		const query = `
    INSERT INTO publisher
      (Id, Name)
    VALUES
      (?, ?)
  `;
		try {
			const stmt = db.prepare(query);
			stmt.run(publisher.Id, publisher.Name);
			deps.logService.success(`Added publisher ${publisher.Name}`);
			return true;
		} catch (error) {
			deps.logService.error(`Failed to add publisher ${publisher.Name}`, error as Error);
			return false;
		}
	};

	const exists = (publisher: Publisher): boolean => {
		const db = deps.getDb();
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
			deps.logService.error(
				`Failed to check if publisher ${publisher.Name} exists`,
				error as Error
			);
			return false;
		}
	};

	const update = (publisher: Publisher): boolean => {
		const db = deps.getDb();
		const query = `
    UPDATE publisher
    SET
      Name = ?
    WHERE Id = ?;
  `;
		try {
			const stmt = db.prepare(query);
			stmt.run(publisher.Name, publisher.Id);
			deps.logService.success(`Updated data for publisher ${publisher.Name}`);
			return true;
		} catch (error) {
			deps.logService.error(`Failed to update publisher ${publisher.Name}`, error as Error);
			return false;
		}
	};

	const getById = (id: string): Publisher | undefined => {
		const db = deps.getDb();
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
			deps.logService.error(`Failed to get publisher with if ${id}`, error as Error);
			return;
		}
	};

	const hasChanges = (oldPublisher: Publisher, newPublisher: Publisher): boolean => {
		return oldPublisher.Id != newPublisher.Id || oldPublisher.Name != newPublisher.Name;
	};

	return {
		add,
		exists,
		update,
		getById,
		hasChanges
	};
};
