import { goto } from '$app/navigation';
import { m } from '$lib/paraglide/messages';
import { apiSSEventDataSchema, type APISSEventType } from '@playnite-insights/lib/client';
import z from 'zod';
import { locator } from '../app-state/serviceLocator.svelte';
import { toast } from '../app-state/toast.svelte';

export type EventSourceManagerListenerCallback<T extends APISSEventType> = (args: {
	data: z.infer<(typeof apiSSEventDataSchema)[T]>;
}) => void;

export type EventSourceManagerListener<T extends APISSEventType = APISSEventType> = {
	type: T;
	cb: EventSourceManagerListenerCallback<T>;
};

export type EventSourceManagerDeps = {
	getSessionId: () => string | null | Promise<string | null>;
};

export class EventSourceManager {
	#eventSource: EventSource | null = null;
	#globalListenersUnsub: Array<() => void>;
	#heartbeatTimeout: ReturnType<typeof setTimeout> | null = null;
	#serverConnectionStatus: boolean;
	#serverConnectionStatusText: string;
	#listeners: Map<APISSEventType, Set<(e: MessageEvent<string>) => void>>;
	#clearHeartbeatListener: ReturnType<typeof this.addListener> | null = null;
	#getSessionId: EventSourceManagerDeps['getSessionId'];
	#authFailed: boolean = false;

	static EVENT_ENDPOINT = '/api/event';

	constructor({ getSessionId }: EventSourceManagerDeps) {
		this.#globalListenersUnsub = [];
		this.#listeners = new Map();
		this.#serverConnectionStatus = $state(false);
		this.#serverConnectionStatusText = $state(m.server_offline_message());
		this.#getSessionId = getSessionId;
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

	async connect() {
		if (this.#eventSource) {
			this.#detachAllListeners();
			this.#eventSource.close();
		}

		const sessionId = (await this.#getSessionId()) ?? '';
		this.#eventSource = new EventSource(
			`${EventSourceManager.EVENT_ENDPOINT}?sessionId=${sessionId}`,
		);

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
					this.#authFailed = false;
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
				type: 'authError',
				cb: async () => {
					if (!this.#authFailed) {
						this.#authFailed = true;
						toast.warning({
							category: 'network',
							title: m.toast_failed_to_connect_with_server_client_not_authorized_title(),
							message: m.toast_failed_to_connect_with_server_client_not_authorized_message(),
							durationMs: 60_000,
							action: () => goto('/auth/login', { replaceState: true }),
						});
						if (this.#eventSource) {
							this.#detachAllListeners();
							this.#eventSource.close();
						}
						if (this.#heartbeatTimeout) clearTimeout(this.#heartbeatTimeout);
					}
				},
			}),
			this.addListener({
				type: 'gameLibraryUpdated',
				cb: async () =>
					await Promise.all([
						locator.gameStore.loadGames(),
						locator.companyStore.loadCompanies(),
						locator.genreStore.loadGenres(),
						locator.platformStore.loadPlatforms(),
						locator.libraryMetricsStore.loadLibraryMetrics(),
					]),
			}),
			this.addListener({
				type: 'sessionOpened',
				cb: async () => await locator.gameSessionStore.loadRecentSessions(),
			}),
			this.addListener({
				type: 'sessionClosed',
				cb: async () => await locator.gameSessionStore.loadRecentSessions(),
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
