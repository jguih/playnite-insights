import { getDb } from '$lib/infrastructure/database';
import { platformSchema, type Platform } from '$lib/platform/schemas';
import z from 'zod';
import { logError, logSuccess } from '../log/log';

export const addPlatform = (platform: Platform): boolean => {
	const db = getDb();
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
		logSuccess(`Added platform ${platform.Name}`);
		return true;
	} catch (error) {
		logError(`Failed to add platform ${platform.Name}`, error as Error);
		return false;
	}
};

export const platformExists = (platform: Pick<Platform, 'Id' | 'Name'>): boolean => {
	const db = getDb();
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
		logError(`Failed to check if platform ${platform.Name} exists`, error as Error);
		return false;
	}
};

export const updatePlatform = (platform: Platform): boolean => {
	const db = getDb();
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
		logSuccess(`Updated data for platform ${platform.Name}`);
		return true;
	} catch (error) {
		logError(`Failed to update platform ${platform.Name}`, error as Error);
		return false;
	}
};

export const getPlatformById = (id: string): Platform | undefined => {
	const db = getDb();
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
		logError(`Failed to get platform with if ${id}`, error as Error);
		return;
	}
};

export const platformHasChanges = (oldPlatform: Platform, newPlatform: Platform): boolean => {
	return (
		oldPlatform.Id != newPlatform.Id ||
		oldPlatform.Name != newPlatform.Name ||
		oldPlatform.SpecificationId != newPlatform.SpecificationId ||
		oldPlatform.Background != newPlatform.Background ||
		oldPlatform.Cover != newPlatform.Cover ||
		oldPlatform.Icon != newPlatform.Icon
	);
};
