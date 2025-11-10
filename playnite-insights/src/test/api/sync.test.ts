import { defaultFileSystemService, getDb, initDatabase } from '@playnite-insights/infra';
import {
	serverSyncReconciliationResponseSchema,
	type ClientSyncReconciliationCommand,
} from '@playnite-insights/lib/client';
import { GameNoteFactory, makeMocks, testUtils } from '@playnite-insights/testing';
import type { DatabaseSync } from 'node:sqlite';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeServerServices, type ServerServices } from '../../lib/server/setup-services';
import * as syncHandler from '../../routes/api/sync/+server';

const mocks = makeMocks();
const gameNoteFactory = new GameNoteFactory();
let db: DatabaseSync;
let services: ServerServices;
let sessionId: string;
let syncId: string;

describe('/api/sync', () => {
	beforeEach(async () => {
		if (!db) throw new Error('DB not initialized');
		if (!services) throw new Error('Services not initialized');
		const now = new Date();
		vi.resetAllMocks();
		testUtils.clearAllTables(db);
		sessionId = await testUtils.registerInstanceAndCreateSessionAsync(services);
		syncId = testUtils.setSyncId(services, now);
	});

	beforeAll(async () => {
		db = getDb({ inMemory: true });
		await initDatabase({
			db,
			fileSystemService: defaultFileSystemService,
			logService: mocks.logService,
			MIGRATIONS_DIR: mocks.config.MIGRATIONS_DIR,
		});
		services = makeServerServices({
			getDb: () => db,
			makeLogService: () => mocks.logService,
			env: { DATA_DIR: '/data', PLAYNITE_HOST_ADDRESS: '', TMP_DIR: '/tmp' },
		});
	});

	it('on reconciliation, server returns all notes and its syncId', async () => {
		// Arrange
		const serverNotes = gameNoteFactory.getNotes(200);
		services.gameNoteRepository.addMany(serverNotes);
		const command: ClientSyncReconciliationCommand = {
			notes: [],
		};
		const event = testUtils.createMockEvent({
			request: testUtils.makeJsonRequest({
				endpoint: '/api/sync',
				method: 'POST',
				body: command,
				sessionId,
				syncId,
			}),
			locals: { services },
		});
		// Act
		const response = await syncHandler.POST(event);
		const responseBodyJson = await response.json();
		const responseBody = serverSyncReconciliationResponseSchema.parse(responseBodyJson);
		// Assert
		expect(response.ok).toBe(true);
		expect(responseBody.syncId).toBe(syncId);
		expect(responseBody.notes).toHaveLength(serverNotes.length);
	});

	afterAll(() => {
		db.close();
	});
});
