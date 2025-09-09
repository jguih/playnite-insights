import { GameNoteFactory, SyncQueueFactory, type GameNote } from '@playnite-insights/lib/client';
import 'fake-indexeddb/auto';
import { beforeAll, describe, expect, it } from 'vitest';
import type { IndexedDbSignal } from '../app-state/AppData.types';
import { GameNoteRepository } from './gameNotesRepository.svelte';
import { INDEXEDDB_CURRENT_VERSION, INDEXEDDB_NAME, openIndexedDbAsync } from './indexeddb';

const indexedDbSignal: IndexedDbSignal = { db: null };
const syncQueueFactory = new SyncQueueFactory();
const gameNoteFactory = new GameNoteFactory();

const invalidNote = (overrides: Partial<GameNote>) => {
	return {
		...gameNoteFactory.create({
			Title: 'Test',
			Content: 'Test',
			GameId: null,
			ImagePath: null,
			SessionId: null,
		}),
		...overrides,
	};
};

describe('GameNotesRepository', () => {
	beforeAll(async () => {
		await openIndexedDbAsync({ dbName: INDEXEDDB_NAME, version: INDEXEDDB_CURRENT_VERSION }).then(
			(db) => {
				db.onversionchange = () => {
					db.close();
				};
				indexedDbSignal.db = db;
			},
		);
	});

	it.each([
		{ note: invalidNote({ CreatedAt: 'invalid' }) },
		{ note: invalidNote({ LastUpdatedAt: 'invalid' }) },
		{ note: invalidNote({ DeletedAt: 'invalid' }) },
	])('put note fails if provided note is invalid', async ({ note }) => {
		// Arrange
		const repo = new GameNoteRepository({ indexedDbSignal, syncQueueFactory });
		// Act
		const result = await repo.putAsync({ note });
		// Assert
		expect(result).toBe(false);
	});

	it('create queue item for created note', async () => {
		// Arrange
		const repo = new GameNoteRepository({ indexedDbSignal, syncQueueFactory });
		const note = gameNoteFactory.create({
			Title: 'Test Note #1',
			Content: 'Testing',
			GameId: null,
			ImagePath: null,
			SessionId: null,
		});
		// Act
		const result = await repo.putAsync({ note });
		const existingNote = await repo.getAsync({ Id: note.Id });
		// Assert
		expect(result).toBe(true);
		expect(existingNote?.Id).toBe(note.Id);
		expect(existingNote?.Title).toMatch(/Test Note #1/i);
	});
});
