import type { ServerTimeSignal } from '../app-state/AppData.types';

export type DateTimeHandlerProps = {
	serverTimeSignal: ServerTimeSignal;
};

export class DateTimeHandler {
	#serverTimeSignal: DateTimeHandlerProps['serverTimeSignal'];

	constructor({ serverTimeSignal }: DateTimeHandlerProps) {
		this.#serverTimeSignal = serverTimeSignal;
	}

	getUtcNow = () => {
		if (!this.#serverTimeSignal.syncPoint || !this.#serverTimeSignal.utcNow) return Date.now();
		const elapsed = performance.now() - this.#serverTimeSignal.syncPoint;
		return this.#serverTimeSignal.utcNow + elapsed;
	};
}
