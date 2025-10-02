import type { KeyValue, KeyValueMap } from '@playnite-insights/lib/client';

export interface IKeyValueRepository {
	/**
	 * Updates a keyvalue entry, will create it if missing
	 * @throws {IndexedDBNotInitializedError} If the DB is not ready
	 * @throws {DOMException} If a transaction fails
	 */
	putAsync: (props: { keyvalue: KeyValue }) => Promise<void>;
	/**
	 * Deletes a keyvalue entry
	 * @throws {IndexedDBNotInitializedError} If the DB is not ready
	 * @throws {DOMException} If a transaction fails
	 */
	deleteAsync: <K extends keyof KeyValueMap>(props: { key: K }) => Promise<void>;
	/**
	 * Finds and returns a keyvalue entry using the given key
	 * @returns The keyvalue entry or `null` when not found
	 * @throws {IndexedDBNotInitializedError} If the DB is not ready
	 * @throws {DOMException} If a transaction fails
	 */
	getAsync: <K extends keyof KeyValueMap>(props: { key: K }) => Promise<KeyValueMap[K] | null>;
}
