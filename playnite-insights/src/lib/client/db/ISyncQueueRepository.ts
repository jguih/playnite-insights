import type { GameNote, SyncQueueItem } from '@playnite-insights/lib/client';
import type { SyncQueueRepository } from './syncQueueRepository.svelte';

type GetAsyncArgs =
	| ({ filterBy: typeof SyncQueueRepository.FILTER_BY.Id } & Pick<SyncQueueItem, 'Id'>)
	| ({ filterBy: typeof SyncQueueRepository.FILTER_BY.Entity_PayloadId_Status_Type } & (Pick<
			SyncQueueItem,
			'Entity' | 'Status' | 'Type'
	  > & { PayloadId: GameNote['Id'] }));

export interface ISyncQueueRepository {
	/**
	 * Finds and returns a sync queue item using the given filters
	 * @returns The item or `null` when not found
	 * @throws {IndexedDBNotInitializedError} If the DB is not ready
	 * @throws {DOMException} If a transaction fails
	 */
	getAsync: (props: GetAsyncArgs) => Promise<SyncQueueItem | null>;
}
