import { GameNoteFactory, SyncQueueFactory, type GameNote } from '@playnite-insights/lib/client';
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { IndexedDbSignal } from '../app-state/AppData.types';
import { GameNoteRepository } from './gameNotesRepository.svelte';
import { INDEXEDDB_CURRENT_VERSION, INDEXEDDB_NAME, openIndexedDbAsync } from './indexeddb';
import { SyncQueueRepository } from './syncQueueRepository.svelte';

const indexedDbSignal: IndexedDbSignal = { db: null, dbReady: null };
const syncQueueFactory = new SyncQueueFactory();
const gameNoteFactory = new GameNoteFactory();

const baseNote = (overrides: Partial<GameNote> = {}) => {
	return {
		...gameNoteFactory.create({
			Title: `test-title-${crypto.randomUUID()}`,
			Content: `test-content-${crypto.randomUUID()}`,
			GameId: null,
			ImagePath: null,
			SessionId: null,
		}),
		...overrides,
	};
};

describe('GameNotesRepository', () => {
	beforeEach(async () => {
		indexedDbSignal.dbReady = openIndexedDbAsync({
			dbName: INDEXEDDB_NAME,
			version: INDEXEDDB_CURRENT_VERSION,
		}).then((db) => {
			db.onversionchange = () => {
				db.close();
			};
			indexedDbSignal.db = db;
		});
	});

	afterEach(() => {
		indexedDB.deleteDatabase(INDEXEDDB_NAME);
	});

	it.each([
		{ note: baseNote({ CreatedAt: 'invalid' }) },
		{ note: baseNote({ LastUpdatedAt: 'invalid' }) },
		{ note: baseNote({ DeletedAt: 'invalid' }) },
	])('put note fails if provided note is invalid', async ({ note }) => {
		// Arrange
		const repo = new GameNoteRepository({ indexedDbSignal, syncQueueFactory });
		// Act
		const result = await repo.putAsync({ note });
		// Assert
		expect(result).toBe(false);
	});

	it('creates a note', async () => {
		// Arrange
		const notesRepo = new GameNoteRepository({ indexedDbSignal, syncQueueFactory });
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
		// Assert
		expect(result).toBe(true);
		expect(existingNote).toMatchObject({
			Id: note.Id,
			Title: note.Title,
			Content: note.Content,
			GameId: note.GameId,
			ImagePath: note.ImagePath,
			SessionId: note.SessionId,
			DeletedAt: null,
		});
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
		await notesRepo.putAsync({ note });
		const createQueueItem = await syncQueueRepo.getAsync({
			filterBy: SyncQueueRepository.FILTER_BY.Entity_PayloadId_Status_Type,
			Entity: 'gameNote',
			PayloadId: note.Id,
			Status: 'pending',
			Type: 'create',
		});
		// Assert
		expect(createQueueItem?.Payload).toMatchObject({
			Id: note.Id,
			Title: note.Title,
			Content: note.Content,
			GameId: note.GameId,
			ImagePath: note.ImagePath,
			SessionId: note.SessionId,
			DeletedAt: null,
		});
		expect(createQueueItem?.Type).toBe('create');
		expect(createQueueItem?.Status).toBe('pending');
		expect(createQueueItem?.Entity).toBe('gameNote');
	});

	it('creates queue item for updated note', async () => {
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
		await notesRepo.putAsync({ note });
		const createQueueItem = await syncQueueRepo.getAsync({
			filterBy: SyncQueueRepository.FILTER_BY.Entity_PayloadId_Status_Type,
			Entity: 'gameNote',
			PayloadId: note.Id,
			Status: 'pending',
			Type: 'create',
		});
		note.GameId = crypto.randomUUID();
		await notesRepo.putAsync({ note });
		const updateQueueItem = await syncQueueRepo.getAsync({
			filterBy: SyncQueueRepository.FILTER_BY.Entity_PayloadId_Status_Type,
			Entity: 'gameNote',
			PayloadId: note.Id,
			Status: 'pending',
			Type: 'update',
		});
		// Assert
		expect(createQueueItem).toBeTruthy();
		expect(updateQueueItem?.Payload).toMatchObject({
			Id: note.Id,
			Title: note.Title,
			Content: note.Content,
			GameId: note.GameId,
			ImagePath: note.ImagePath,
			SessionId: note.SessionId,
			DeletedAt: null,
		});
		expect(updateQueueItem?.Type).toBe('update');
		expect(updateQueueItem?.Status).toBe('pending');
		expect(updateQueueItem?.Entity).toBe('gameNote');
	});

	it('creates multiple notes', async () => {
		// Arrange
		const notesRepo = new GameNoteRepository({ indexedDbSignal, syncQueueFactory });
		// Act
		await notesRepo.putAsync({ note: baseNote({ Title: 'note1' }) });
		await notesRepo.putAsync({ note: baseNote({ Title: 'note2' }) });
		await notesRepo.putAsync({ note: baseNote({ Title: 'note3' }) });
		const notes = await notesRepo.getAllAsync();
		// Assert
		expect(notes).toHaveLength(3);
	});
});
