import { type SyncQueueItem } from '@playnite-insights/lib/client';
import { runRequest, runTransaction } from './indexeddb';
import type { ISyncQueueRepository } from './ISyncQueueRepository';
import { IndexedDBRepository, type IndexedDBRepositoryDeps } from './repository.svelte';

export class SyncQueueRepository extends IndexedDBRepository implements ISyncQueueRepository {
	static STORE_NAME = 'syncQueue' as const;

	static INDEX = {
		Entity_PayloadId_Status_Type: 'Entity_PayloadId_Status_Type',
		Entity_PayloadId_Status: 'Entity_PayloadId_Status',
		byType: 'byType',
		byStatus: 'byStatus',
	} as const;

	static FILTER_BY = {
		Id: 'Id',
		Entity_PayloadId_Status_Type: SyncQueueRepository.INDEX.Entity_PayloadId_Status_Type,
	} as const;

	constructor(deps: IndexedDBRepositoryDeps) {
		super(deps);
	}

	getAsync: ISyncQueueRepository['getAsync'] = async (props) => {
		return this.withDb(async (db) => {
			return await runTransaction(db, 'syncQueue', 'readonly', async ({ tx }) => {
				const syncQueueStore = tx.objectStore(SyncQueueRepository.STORE_NAME);
				let queueItem: SyncQueueItem | null = null;

				switch (props.filterBy) {
					case SyncQueueRepository.FILTER_BY.Id: {
						queueItem =
							(await runRequest<SyncQueueItem | undefined>(syncQueueStore.get(props.Id))) ?? null;
						break;
					}
					case SyncQueueRepository.FILTER_BY.Entity_PayloadId_Status_Type: {
						const index = syncQueueStore.index(
							SyncQueueRepository.INDEX.Entity_PayloadId_Status_Type,
						);
						queueItem =
							(await runRequest<SyncQueueItem | undefined>(
								index.get([props.Entity, props.PayloadId, props.Status, props.Type]),
							)) ?? null;
						break;
					}
				}

				return queueItem;
			});
		});
	};

	getAllAsync: ISyncQueueRepository['getAllAsync'] = async () => {
		return this.withDb(async (db) => {
			return await runTransaction(db, 'syncQueue', 'readonly', async ({ tx }) => {
				const syncQueueStore = tx.objectStore(SyncQueueRepository.STORE_NAME);
				const queueItems = await runRequest<SyncQueueItem[]>(syncQueueStore.getAll());
				return queueItems;
			});
		});
	};

	static defineSchema({
		db,
		tx,
		oldVersion,
	}: {
		db: IDBDatabase;
		tx: IDBTransaction;
		oldVersion: number;
		newVersion: number | null;
	}) {
		if (!db.objectStoreNames.contains(this.STORE_NAME)) {
			const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'Id', autoIncrement: true });
			store.createIndex(this.INDEX.byType, 'Type', { unique: false });
			store.createIndex(this.INDEX.byStatus, 'Status', { unique: false });
		}

		const store = tx.objectStore(this.STORE_NAME);

		// BEGIN Migration 1: Add Entity_PayloadId_Status index
		if (oldVersion < 3 && !store.indexNames.contains(this.INDEX.Entity_PayloadId_Status)) {
			store.createIndex(this.INDEX.Entity_PayloadId_Status, ['Entity', 'Payload.Id', 'Status'], {
				unique: false,
			});
		}
		// END Migration 1

		// BEGIN Migration 2: Add Entity_PayloadId_Status_Type index
		if (oldVersion < 4 && !store.indexNames.contains(this.INDEX.Entity_PayloadId_Status_Type)) {
			store.createIndex(
				this.INDEX.Entity_PayloadId_Status_Type,
				['Entity', 'Payload.Id', 'Status', 'Type'],
				{ unique: false },
			);
		}
		// END Migration 2
	}
}
