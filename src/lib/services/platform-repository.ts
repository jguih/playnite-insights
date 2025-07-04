import { getDb } from '$lib/infrastructure/database';
import type { Platform } from '$lib/models/platform';
import { logError, logSuccess } from './log';

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
