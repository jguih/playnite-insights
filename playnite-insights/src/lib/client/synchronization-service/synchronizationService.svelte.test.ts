import { TestServiceLocator } from '$lib/test/testServiceLocator';
import { makeMocks } from '@playnite-insights/testing';
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { INDEXEDDB_NAME } from '../db/indexeddb';

const mocks = makeMocks();
let locator: TestServiceLocator;

describe('Synchronization Service', () => {
	beforeEach(async () => {
		vi.resetAllMocks();
		locator = new TestServiceLocator(mocks);
	});

	afterEach(() => {
		indexedDB.deleteDatabase(INDEXEDDB_NAME);
	});

	it('works', async () => {
		const { syncService } = locator;
		syncService.getSyncId();
		expect(true).toBeTruthy();
	});
});
