import type { IFetchClient } from '@playnite-insights/lib/client';

export type HttpClientSignal = { client: IFetchClient | null };
export type IndexedDbSignal = { db: IDBDatabase | null; dbReady: Promise<void> | null };
