import { GameNoteFactory, SyncQueueFactory } from '@playnite-insights/lib/client';
import { GameNoteRepository } from '../db/gameNotesRepository.svelte';
import { SyncQueueRepository } from '../db/syncQueueRepository.svelte';
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
}
