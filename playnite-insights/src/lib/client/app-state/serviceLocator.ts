import { GameNoteFactory, SyncQueueFactory } from '@playnite-insights/lib/client';
import { GameNoteRepository } from '../db/gameNotesRepository.svelte';
import { SyncQueueRepository } from '../db/syncQueueRepository.svelte';
import { EventSourceManager } from '../event-source-manager/eventSourceManager.svelte';
import { ServerHeartbeat } from '../event-source-manager/serverHeartbeat.svelte';
import { ServiceWorkerUpdater } from '../sw-updater.svelte';
import { SyncQueue } from '../sync-queue/syncQueue';
import { DateTimeHandler } from '../utils/dateTimeHandler.svelte';
import type { HttpClientSignal, IndexedDbSignal, ServerTimeSignal } from './AppData.types';

export type ClientServiceLocatorFactory = {
	syncQueue: SyncQueueFactory;
	gameNote: GameNoteFactory;
};

export type ClientServiceLocatorRepository = {
	gameNote: GameNoteRepository;
	syncQueue: SyncQueueRepository;
};

export type ClientServiceLocatorDeps = {
	indexedDbSignal: IndexedDbSignal;
	serverTimeSignal: ServerTimeSignal;
	httpClientSignal: HttpClientSignal;
};

export class ClientServiceLocator {
	#dateTimeHandler: DateTimeHandler;
	#factory: ClientServiceLocatorFactory;
	#repository: ClientServiceLocatorRepository;
	#syncQueue: SyncQueue;
	#eventSourceManager: EventSourceManager;
	#serviceWorkerUpdater: ServiceWorkerUpdater;
	#serverHeartbeat: ServerHeartbeat;

	constructor({ indexedDbSignal, serverTimeSignal, httpClientSignal }: ClientServiceLocatorDeps) {
		this.#dateTimeHandler = new DateTimeHandler({ serverTimeSignal });
		this.#factory = {
			gameNote: new GameNoteFactory(),
			syncQueue: new SyncQueueFactory(),
		};
		this.#repository = {
			gameNote: new GameNoteRepository({
				indexedDbSignal,
				dateTimeHandler: this.#dateTimeHandler,
				syncQueueFactory: this.#factory.syncQueue,
			}),
			syncQueue: new SyncQueueRepository({ indexedDbSignal }),
		};
		this.#syncQueue = new SyncQueue({
			indexedDbSignal,
			syncQueueRepository: this.#repository.syncQueue,
			httpClientSignal,
		});
		this.#eventSourceManager = new EventSourceManager();
		this.#serviceWorkerUpdater = new ServiceWorkerUpdater();
		this.#serverHeartbeat = new ServerHeartbeat({ eventSourceManager: this.#eventSourceManager });
	}

	get dateTimeHandler() {
		return this.#dateTimeHandler;
	}

	get factory() {
		return this.#factory;
	}

	get repository() {
		return this.#repository;
	}

	get syncQueue() {
		return this.#syncQueue;
	}

	get eventSourceManager() {
		return this.#eventSourceManager;
	}

	get serviceWorkerUpdater() {
		return this.#serviceWorkerUpdater;
	}

	get serverHeartbeat() {
		return this.#serverHeartbeat;
	}
}
