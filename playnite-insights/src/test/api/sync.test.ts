import { defaultFileSystemService, getDb, initDatabase } from '@playnite-insights/infra';
import { type ClientSyncReconciliationCommand } from '@playnite-insights/lib/client';
import { makeMocks, testUtils } from '@playnite-insights/testing';
import type { DatabaseSync } from 'node:sqlite';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeServerServices, type ServerServices } from '../../lib/server/setup-services';
import * as syncHandler from '../../routes/api/sync/+server';

const mocks = makeMocks();
let db: DatabaseSync;
let services: ServerServices;
const baseUrl = 'https://test.com';

describe('/api/sync', () => {
	beforeEach(async () => {
		vi.resetAllMocks();
		testUtils.clearAllTables(db);
	});

	beforeAll(async () => {
		db = getDb({ inMemory: true });
		await initDatabase({
			db,
			fileSystemService: defaultFileSystemService,
			logService: mocks.logService,
			MIGRATIONS_DIR: mocks.config.MIGRATIONS_DIR,
		});
		services = makeServerServices({ getDb: () => db, makeLogService: () => mocks.logService });
	});

	it('works', async () => {
		// Arrange
		const command: ClientSyncReconciliationCommand = {
			notes: [],
		};
		const event = testUtils.createMockEvent({
			request: new Request(`${baseUrl}/api/sync`, {
				method: 'POST',
				body: JSON.stringify(command),
			}),
			locals: { services },
		});
		// Act
		const response = await syncHandler.POST(event);
		// Assert
		expect(response.ok).toBe(false);
	});

	afterAll(() => {
		db.close();
	});
});
