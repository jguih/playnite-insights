import { m } from '$lib/paraglide/messages';
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
import { toast } from '../app-state/toast.svelte';

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

	static EVENT_ENDPOINT = '/api/event';

	constructor() {
		this.#globalListenersUnsub = [];
		this.#serverConnectionStatus = $state(true);
		this.#serverConnectionStatusText = $state(m.toast_server_online_message());
		this.#connect();
	}

	#connect() {
		if (this.#eventSource) this.#eventSource.close();
		this.#eventSource = new EventSource(EventSourceManager.EVENT_ENDPOINT);
		this.#resetHeartbeat();
		this.addListener({
			type: 'heartbeat',
			cb: () => {
				if (this.serverConnectionStatus === false) {
					this.#serverConnectionStatus = true;
					this.#serverConnectionStatusText = m.toast_server_online_message();
					toast.success({ category: 'network', message: m.toast_server_online_message() });
				}
				this.#resetHeartbeat();
			},
		});
	}

	#resetHeartbeat() {
		if (this.#heartbeatTimeout) clearTimeout(this.#heartbeatTimeout);
		this.#heartbeatTimeout = setTimeout(() => {
			if (this.serverConnectionStatus === true) {
				this.#serverConnectionStatus = false;
				this.#serverConnectionStatusText = m.toast_server_offline_title();
				toast.warning({
					category: 'network',
					message: m.toast_server_offline_message(),
					title: m.toast_server_offline_title(),
				});
			}
			this.#connect();
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

	addListener = <T extends APISSEventType>(listener: EventSourceManagerListener<T>) => {
		const handler = (e: MessageEvent) => {
			try {
				const parsed = this.#parseEvent(listener.type, e.data as string);
				listener.cb({ data: parsed });
			} catch (error) {
				console.error(error);
			}
		};

		this.#eventSource?.addEventListener(listener.type, handler);

		// return unsubscribe
		return () => {
			this.#eventSource?.removeEventListener(listener.type, handler);
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
		this.#eventSource?.close();
	};

	get serverConnectionStatusText() {
		return this.#serverConnectionStatusText;
	}

	get serverConnectionStatus() {
		return this.#serverConnectionStatus;
	}
}
