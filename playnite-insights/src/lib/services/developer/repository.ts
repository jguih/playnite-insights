import { developerSchema, type Developer } from '$lib/services/developer/schemas';
import z from 'zod';
import type { DatabaseSync } from 'node:sqlite';
import type { LogService } from '@playnite-insights/core';

type DeveloperRepositoryDeps = {
	getDb: () => DatabaseSync;
	logService: LogService;
};

export type DeveloperRepository = {
	add: (platform: Developer) => boolean;
	exists: (developer: Pick<Developer, 'Id' | 'Name'>) => boolean;
	update: (platform: Developer) => boolean;
	getById: (id: string) => Developer | undefined;
	hasChanges: (oldDeveloper: Developer, newDeveloper: Developer) => boolean;
};

export const makeDeveloperRepository = ({
	getDb,
	logService
}: DeveloperRepositoryDeps): DeveloperRepository => {
	const add = (developer: Developer): boolean => {
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
			logService.debug(`Added developer ${developer.Name}`);
			return true;
		} catch (error) {
			logService.error(`Failed to add developer ${developer.Name}`, error as Error);
			return false;
		}
	};

	const exists = (developer: Developer): boolean => {
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
			logService.error(`Failed to check if developer ${developer.Name} exists`, error as Error);
			return false;
		}
	};

	const update = (developer: Developer): boolean => {
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
			logService.debug(`Updated data for developer ${developer.Name}`);
			return true;
		} catch (error) {
			logService.error(`Failed to update developer ${developer.Name}`, error as Error);
			return false;
		}
	};

	const getById = (id: string): Developer | undefined => {
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
			logService.debug(`Found developer: ${dev?.Name}`);
			return dev;
		} catch (error) {
			logService.error(`Failed to get developer with if ${id}`, error as Error);
			return;
		}
	};

	const hasChanges = (oldDev: Developer, newDev: Developer): boolean => {
		return oldDev.Id != newDev.Id || oldDev.Name != newDev.Name;
	};

	return {
		add,
		update,
		exists,
		getById,
		hasChanges
	};
};
