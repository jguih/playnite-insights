import type { ILogServicePort } from "./log-service.port";
import type { IPlayAtlasEventHubPort } from "./playatlas-event-hub.port";
import type { IPlayAtlasSSEClientPort } from "./playatlas-sse-client.port";

export type PlayAtlasSSEHandler = (data: unknown, eventId: string) => void;

export type PlayAtlasSSEClientDeps = {
	handlers?: Map<string, Set<PlayAtlasSSEHandler>>;
	logService: ILogServicePort;
};

export class PlayAtlasSSEClient implements IPlayAtlasSSEClientPort, IPlayAtlasEventHubPort {
	private eventSource: EventSource | null = null;
	private handlers = new Map<string, Set<PlayAtlasSSEHandler>>();

	constructor(private readonly deps: PlayAtlasSSEClientDeps) {
		if (deps.handlers)
			for (const [eventId, handlers] of deps.handlers) {
				this.handlers.set(eventId, handlers);
			}
	}

	private dispatch = (eventType: string, event: MessageEvent) => {
		const handlers = this.handlers.get(eventType);
		if (!handlers) return;

		for (const handler of handlers) {
			try {
				handler(JSON.parse(event.data), event.lastEventId);
			} catch (err) {
				this.deps.logService.error(`Failed to process SSE ${eventType}`, err);
			}
		}
	};

	start: IPlayAtlasSSEClientPort["start"] = () => {
		this.eventSource = new EventSource("/api/event", {
			withCredentials: true,
		});

		this.eventSource.onopen = () => {
			this.deps.logService.info("SSE connected to PlayAtlas");
		};

		this.eventSource.onerror = (err) => {
			this.deps.logService.error("SSE connection error", err);
		};

		this.eventSource.onmessage = (event) => {
			this.dispatch("message", event);
		};

		for (const eventType of this.handlers.keys()) {
			this.eventSource.addEventListener(eventType, (event: MessageEvent) => {
				this.dispatch(eventType, event);
			});
		}
	};

	stop: IPlayAtlasSSEClientPort["stop"] = () => {
		this.eventSource?.close();
		this.eventSource = null;
	};

	subscribe = (eventType: string, handler: PlayAtlasSSEHandler) => {
		if (!this.eventSource) throw new Error("Event Source was not initialized");

		if (!this.handlers.has(eventType)) {
			this.handlers.set(eventType, new Set());

			this.eventSource?.addEventListener(eventType, (event: MessageEvent) => {
				this.dispatch(eventType, event);
			});
		}

		this.handlers.get(eventType)!.add(handler);

		return () => {
			this.unsubscribe(eventType, handler);
		};
	};

	unsubscribe = (eventType: string, handler: PlayAtlasSSEHandler) => {
		const set = this.handlers.get(eventType);
		if (!set) return;

		set.delete(handler);

		if (set.size === 0) {
			this.handlers.delete(eventType);
		}
	};
}
