import type { EventSourceManager } from './eventSourceManager.svelte';

export type ServerHeartbeatDeps = {
	eventSourceManager: EventSourceManager;
};

export interface IServerHeartbeat {
	isAlive: boolean;
}

export class ServerHeartbeat implements IServerHeartbeat {
	#eventSourceManager: ServerHeartbeatDeps['eventSourceManager'];
	#isAlive: boolean;

	constructor(deps: ServerHeartbeatDeps) {
		this.#eventSourceManager = deps.eventSourceManager;

		this.#isAlive = $derived.by(() => {
			const status = this.#eventSourceManager.serverConnectionStatus;
			return status;
		});
	}

	get isAlive() {
		return this.#isAlive;
	}
}
