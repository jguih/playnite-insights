import type { ServerTimeStore } from '../app-state/stores/serverTimeStore.svelte';

export type DateTimeHandlerProps = {
	serverTimeStore: ServerTimeStore;
};

export interface IDateTimeHandler {
	getUtcNow: () => number;
}

export class DateTimeHandler implements IDateTimeHandler {
	#serverTimeStore: DateTimeHandlerProps['serverTimeStore'];

	constructor({ serverTimeStore }: DateTimeHandlerProps) {
		this.#serverTimeStore = serverTimeStore;
	}

	getUtcNow = () => {
		if (!this.#serverTimeStore.syncPoint || !this.#serverTimeStore.utcNow) return Date.now();
		const elapsed = performance.now() - this.#serverTimeStore.syncPoint;
		return this.#serverTimeStore.utcNow + elapsed;
	};
}
