import { platformSchema, type Platform } from '$lib/platform/schemas';
import z from 'zod';
import type { DatabaseSync } from 'node:sqlite';
import type { LogService } from '$lib/services/log';

type PlatformRepositoryDeps = {
	getDb: () => DatabaseSync;
	logService: LogService;
};

export type PlatformRepository = {
	add: (platform: Platform) => boolean;
	exists: (platform: Pick<Platform, 'Id' | 'Name'>) => boolean;
	update: (platform: Platform) => boolean;
	getById: (id: string) => Platform | undefined;
	hasChanges: (oldPlatform: Platform, newPlatform: Platform) => boolean;
};

export const makePlatformRepository = (deps: PlatformRepositoryDeps): PlatformRepository => {
	const add = (platform: Platform): boolean => {
		const db = deps.getDb();
		const query = `
        INSERT INTO platform
          (Id, Name, SpecificationId, Icon, Cover, Background)
        VALUES
          (?, ?, ?, ?, ?, ?)
      `;
		try {
			const stmt = db.prepare(query);
			stmt.run(
				platform.Id,
				platform.Name,
				platform.SpecificationId,
				platform.Icon,
				platform.Cover,
				platform.Background
			);
			deps.logService.success(`Added platform ${platform.Name}`);
			return true;
		} catch (error) {
			deps.logService.error(`Failed to add platform ${platform.Name}`, error as Error);
			return false;
		}
	};

	const exists = (platform: Pick<Platform, 'Id' | 'Name'>): boolean => {
		const db = deps.getDb();
		const query = `
        SELECT EXISTS (
          SELECT 1 FROM platform 
          WHERE Id = (?)
        )
      `;
		try {
			const stmt = db.prepare(query);
			const result = stmt.get(platform.Id);
			if (result) {
				return Object.values(result)[0] === 1;
			}
			return false;
		} catch (error) {
			deps.logService.error(`Failed to check if platform ${platform.Name} exists`, error as Error);
			return false;
		}
	};

	const update = (platform: Platform): boolean => {
		const db = deps.getDb();
		const query = `
      UPDATE platform
      SET
        Name = ?,
        SpecificationId = ?,
        Icon = ?,
        Cover = ?,
        Background = ?
      WHERE Id = ?;
    `;
		try {
			const stmt = db.prepare(query);
			stmt.run(
				platform.Name,
				platform.SpecificationId,
				platform.Icon,
				platform.Cover,
				platform.Background,
				platform.Id
			);
			deps.logService.success(`Updated data for platform ${platform.Name}`);
			return true;
		} catch (error) {
			deps.logService.error(`Failed to update platform ${platform.Name}`, error as Error);
			return false;
		}
	};

	const getById = (id: string): Platform | undefined => {
		const db = deps.getDb();
		const query = `
      SELECT *
      FROM platform
      WHERE Id = ?;
    `;
		try {
			const stmt = db.prepare(query);
			const result = stmt.get(id);
			const dev = z.optional(platformSchema).parse(result);
			return dev;
		} catch (error) {
			deps.logService.error(`Failed to get platform with if ${id}`, error as Error);
			return;
		}
	};

	const hasChanges = (oldPlatform: Platform, newPlatform: Platform): boolean => {
		return (
			oldPlatform.Id != newPlatform.Id ||
			oldPlatform.Name != newPlatform.Name ||
			oldPlatform.SpecificationId != newPlatform.SpecificationId ||
			oldPlatform.Background != newPlatform.Background ||
			oldPlatform.Cover != newPlatform.Cover ||
			oldPlatform.Icon != newPlatform.Icon
		);
	};

	return {
		add,
		update,
		exists,
		getById,
		hasChanges
	};
};
