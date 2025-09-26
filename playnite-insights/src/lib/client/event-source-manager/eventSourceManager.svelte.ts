import { m } from '$lib/paraglide/messages';
import { apiSSEventDataSchema, type APISSEventType } from '@playnite-insights/lib/client';
import z from 'zod';
import {
	loadGenres,
	loadLibraryMetrics,
	loadPlatforms,
	loadRecentGameSessions,
	locator,
} from '../app-state/AppData.svelte';

export type EventSourceManagerListenerCallback<T extends APISSEventType> = (args: {
	data: z.infer<(typeof apiSSEventDataSchema)[T]>;
}) => void;

export type EventSourceManagerListener<T extends APISSEventType = APISSEventType> = {
	type: T;
	cb: EventSourceManagerListenerCallback<T>;
};

export class EventSourceManager {
	#eventSource: EventSource | null = null;
	#globalListenersUnsub: Array<() => void>;
	#heartbeatTimeout: ReturnType<typeof setTimeout> | null = null;
	#serverConnectionStatus: boolean;
	#serverConnectionStatusText: string;
	#listeners: Map<APISSEventType, Set<(e: MessageEvent<string>) => void>>;
	#clearHeartbeatListener: ReturnType<typeof this.addListener> | null = null;

	static EVENT_ENDPOINT = '/api/event';

	constructor() {
		this.#globalListenersUnsub = [];
		this.#listeners = new Map();
		this.#serverConnectionStatus = $state(false);
		this.#serverConnectionStatusText = $state(m.server_offline_message());
	}

	#resetHeartbeat() {
		if (this.#heartbeatTimeout) clearTimeout(this.#heartbeatTimeout);
		this.#heartbeatTimeout = setTimeout(() => {
			if (this.serverConnectionStatus === true) {
				this.#serverConnectionStatus = false;
				this.#serverConnectionStatusText = m.server_offline_message();
			}
			this.connect();
		}, 20_000);
	}

	#parseEvent = <T extends APISSEventType>(
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

	#detachAllListeners() {
		if (!this.#eventSource) return;
		for (const [type, set] of this.#listeners) {
			for (const cb of set) {
				this.#eventSource.removeEventListener(type, cb);
			}
		}
	}

	#removeListener = (type: APISSEventType, cb: (e: MessageEvent<string>) => void) => {
		const set = this.#listeners.get(type);
		if (!set) return;

		set.delete(cb);
		if (this.#eventSource) {
			this.#eventSource.removeEventListener(type, cb);
		}
		if (set.size === 0) {
			this.#listeners.delete(type);
		}
	};

	connect() {
		if (this.#eventSource) {
			this.#detachAllListeners();
			this.#eventSource.close();
		}

		this.#eventSource = new EventSource(EventSourceManager.EVENT_ENDPOINT);

		for (const [type, set] of this.#listeners) {
			for (const cb of set) this.#eventSource.addEventListener(type, cb);
		}

		this.#resetHeartbeat();

		this.#clearHeartbeatListener?.();
		this.#clearHeartbeatListener = this.addListener({
			type: 'heartbeat',
			cb: () => {
				if (this.serverConnectionStatus === false) {
					this.#serverConnectionStatus = true;
					this.#serverConnectionStatusText = m.server_online_message();
				}
				this.#resetHeartbeat();
			},
		});
	}

	addListener = <T extends APISSEventType>(listener: EventSourceManagerListener<T>) => {
		const handler = (e: MessageEvent<string>) => {
			try {
				const parsed = this.#parseEvent(listener.type, e.data);
				listener.cb({ data: parsed });
			} catch (error) {
				console.error(error);
			}
		};

		if (!this.#listeners.has(listener.type)) {
			this.#listeners.set(listener.type, new Set());
		}
		this.#listeners.get(listener.type)!.add(handler);

		if (this.#eventSource) {
			this.#eventSource.addEventListener(listener.type, handler);
		}

		return () => {
			this.#removeListener(listener.type, handler);
		};
	};

	setupGlobalListeners = () => {
		this.clearGlobalListeners();
		this.#globalListenersUnsub.push(
			this.addListener({
				type: 'gameLibraryUpdated',
				cb: async () =>
					await Promise.all([
						locator.gameStore.loadGames(),
						locator.companyStore.loadCompanies(),
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
		if (this.#heartbeatTimeout) clearTimeout(this.#heartbeatTimeout);
		this.#detachAllListeners();
		this.#eventSource?.close();
		this.#eventSource = null;
	};

	get serverConnectionStatusText() {
		return this.#serverConnectionStatusText;
	}

	get serverConnectionStatus() {
		return this.#serverConnectionStatus;
	}
}
