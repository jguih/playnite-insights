import { apiSSEventDataSchema, type APISSEventType } from '@playnite-insights/lib/client';
import z from 'zod';

export type EventSourceManagerListener<T extends APISSEventType = APISSEventType> = {
	type: T;
	cb: (args: { data: z.infer<(typeof apiSSEventDataSchema)[T]> }) => void;
};

export class EventSourceManager {
	#eventSource: EventSource;

	constructor() {
		this.#eventSource = new EventSource('/api/event');

		this.#eventSource.onerror = (e) => {
			console.error('SSE connection error:', e);
		};
	}

	parseEvent = <T extends APISSEventType>(
		type: T,
		raw: string,
	): z.infer<(typeof apiSSEventDataSchema)[T]> => {
		let data: unknown = raw;

		try {
			data = JSON.parse(raw);
		} catch {
			// Keep raw data
		}

		return apiSSEventDataSchema[type].parse(data);
	};

	addListener = <T extends APISSEventType>(listener: EventSourceManagerListener<T>) => {
		const handler = (e: MessageEvent) => {
			try {
				const parsed = this.parseEvent(listener.type, e.data as string);
				listener.cb({ data: parsed });
			} catch (error) {
				console.error(error);
			}
		};

		this.#eventSource.addEventListener(listener.type, handler);

		// return unsubscribe
		return () => {
			this.#eventSource.removeEventListener(listener.type, handler);
		};
	};

	close = () => {
		this.#eventSource.close();
	};
}
