import { apiSSEventDataSchema, type APISSEventType } from '@playnite-insights/lib/client';
import z from 'zod';
import {
	loadCompanies,
	loadGames,
	loadGenres,
	loadLibraryMetrics,
	loadPlatforms,
	loadRecentGameSessions,
} from '../app-state/AppData.svelte';

export type EventSourceManagerListenerCallback<T extends APISSEventType> = (args: {
	data: z.infer<(typeof apiSSEventDataSchema)[T]>;
}) => void;

export type EventSourceManagerListener<T extends APISSEventType = APISSEventType> = {
	type: T;
	cb: EventSourceManagerListenerCallback<T>;
};

export class EventSourceManager {
	#eventSource: EventSource;
	#globalListenersUnsub: Array<() => void>;

	constructor() {
		this.#eventSource = new EventSource('/api/event');
		this.#globalListenersUnsub = [];

		this.#eventSource.onerror = (e) => {
			console.error('SSE connection error:', e);
		};
	}

	private parseEvent = <T extends APISSEventType>(
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

	setupGlobalListeners = () => {
		this.clearGlobalListeners();
		this.#globalListenersUnsub.push(
			this.addListener({
				type: 'gameLibraryUpdated',
				cb: async () =>
					await Promise.all([
						loadGames(),
						loadCompanies(),
						loadGenres(),
						loadPlatforms(),
						loadLibraryMetrics(),
					]),
			}),
			this.addListener({
				type: 'sessionOpened',
				cb: async () => await loadRecentGameSessions(),
			}),
			this.addListener({
				type: 'sessionClosed',
				cb: async () => await loadRecentGameSessions(),
			}),
		);
	};

	clearGlobalListeners = () => {
		for (const unsub of this.#globalListenersUnsub) {
			unsub();
		}
		this.#globalListenersUnsub = [];
	};

	close = () => {
		this.#eventSource.close();
	};
}
