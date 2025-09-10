import { GameNoteFactory, SyncQueueFactory, type GameNote } from '@playnite-insights/lib/client';
import 'fake-indexeddb/auto';
import { beforeAll, describe, expect, it } from 'vitest';
import type { IndexedDbSignal } from '../app-state/AppData.types';
import { GameNoteRepository } from './gameNotesRepository.svelte';
import { INDEXEDDB_CURRENT_VERSION, INDEXEDDB_NAME, openIndexedDbAsync } from './indexeddb';
import { SyncQueueRepository } from './syncQueueRepository.svelte';

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
		const notesRepo = new GameNoteRepository({ indexedDbSignal, syncQueueFactory });
		const syncQueueRepo = new SyncQueueRepository({ indexedDbSignal });
		const note = gameNoteFactory.create({
			Title: 'Test Note #1',
			Content: 'Testing',
			GameId: null,
			ImagePath: null,
			SessionId: null,
		});
		// Act
		const result = await notesRepo.putAsync({ note });
		const existingNote = await notesRepo.getAsync({ filterBy: 'Id', Id: note.Id });
		const existingQueueItem = await syncQueueRepo.getAsync({
			filterBy: SyncQueueRepository.FILTER_BY.Entity_PayloadId_Status_Type,
			Entity: 'gameNote',
			PayloadId: note.Id,
			Status: 'pending',
			Type: 'create',
		});
		// Assert
		expect(result).toBe(true);
		expect(existingQueueItem?.Payload).toMatchObject({
			Id: note.Id,
			Title: note.Title,
			Content: note.Content,
		});
		expect(existingNote?.Id).toBe(note.Id);
		expect(existingNote?.Title).toMatch(/Test Note #1/i);
		expect(existingQueueItem?.Type).toMatch('create');
		expect(existingQueueItem?.Status).toBe('pending');
		expect(existingQueueItem?.Entity).toBe('gameNote');
	});
});
