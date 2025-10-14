import { TestServiceLocator } from '$lib/test/testServiceLocator';
import { faker } from '@faker-js/faker';
import {
	AppClientError,
	FetchClientStrategyError,
	type ServerSyncReconciliationResponse,
} from '@playnite-insights/lib/client';
import { makeMocks } from '@playnite-insights/testing';
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { INDEXEDDB_NAME } from '../db/indexeddb';

const mocks = makeMocks();
const fetchClient = mocks.fetchClient;
let locator: TestServiceLocator;

describe('Synchronization Service', () => {
	beforeEach(async () => {
		vi.resetAllMocks();
		locator = new TestServiceLocator(mocks);
		locator.httpClient = fetchClient;
	});

	afterEach(() => {
		indexedDB.deleteDatabase(INDEXEDDB_NAME);
	});

	it('returns correct SyncId', async () => {
		// Arrange
		const { syncService, keyValueRepository } = locator;
		const syncId = faker.string.uuid();
		await keyValueRepository.putAsync({ keyvalue: { Key: 'sync-id', Value: syncId } });
		// Act
		const existingSyndId = await syncService.getSyncId();
		// Assert
		expect(existingSyndId).toBe(syncId);
	});

	it('triggers reconciliation when server returns 409 during SyncId check', async () => {
		// Arrange
		const { syncService } = locator;
		fetchClient.httpGetAsync.mockImplementationOnce(() => {
			throw new FetchClientStrategyError({ statusCode: 409, message: 'Request failed with 409' });
		});
		fetchClient.httpPostAsync.mockResolvedValueOnce({
			syncId: faker.string.uuid(),
			notes: [],
		} as ServerSyncReconciliationResponse);
		// Act
		try {
			await syncService.ensureValidLocalSyncId({ waitForReconcile: true });
		} catch (error) {
			if (error instanceof AppClientError) {
				expect(error.code).toBe('invalid_syncid');
			}
		}
		// Assert
		expect(fetchClient.httpGetAsync).toHaveBeenCalledWith(
			expect.objectContaining({ endpoint: '/api/sync/check' }),
		);
		expect(fetchClient.httpPostAsync).toHaveBeenCalledWith(
			expect.objectContaining({ endpoint: '/api/sync' }),
		);
	});

	it('does not trigger reconciliation when server returns 200 during SyncId check', async () => {
		// Arrange
		const { syncService } = locator;
		fetchClient.httpGetAsync.mockImplementationOnce(() => {});
		fetchClient.httpPostAsync.mockResolvedValueOnce({
			syncId: faker.string.uuid(),
			notes: [],
		} as ServerSyncReconciliationResponse);
		// Act
		await syncService.ensureValidLocalSyncId();
		// Assert
		expect(fetchClient.httpGetAsync).toHaveBeenCalledWith(
			expect.objectContaining({ endpoint: '/api/sync/check' }),
		);
		expect(fetchClient.httpPostAsync).not.toHaveBeenCalledWith(
			expect.objectContaining({ endpoint: '/api/sync' }),
		);
	});
});
