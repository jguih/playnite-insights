import type { PlayAtlasSSEHandler } from "./playatlas-sse-client";

export type IPlayAtlasEventHubPort = {
	subscribe: (eventType: string, handler: PlayAtlasSSEHandler) => () => void;
	unsubscribe: (eventType: string, handler: PlayAtlasSSEHandler) => void;
};
