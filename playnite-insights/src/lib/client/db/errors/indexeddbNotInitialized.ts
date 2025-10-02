export class IndexedDBNotInitializedError extends Error {
	constructor() {
		super('IndexedDB is not initialized');
		this.name = 'IndexedDBNotInitializedError';
	}
}
