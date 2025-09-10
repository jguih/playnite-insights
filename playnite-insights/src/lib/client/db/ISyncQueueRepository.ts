import type { GameNote, SyncQueueItem } from '@playnite-insights/lib/client';
import type { SyncQueueRepository } from './syncQueueRepository.svelte';

type GetAsyncArgs =
	| ({ filterBy: typeof SyncQueueRepository.FILTER_BY.Id } & Pick<SyncQueueItem, 'Id'>)
	| ({ filterBy: typeof SyncQueueRepository.FILTER_BY.Entity_PayloadId_Status_Type } & (Pick<
			SyncQueueItem,
			'Entity' | 'Status' | 'Type'
	  > & { PayloadId: GameNote['Id'] }));

export interface ISyncQueueRepository {
	getAsync: (props: GetAsyncArgs) => Promise<SyncQueueItem | null>;
}
