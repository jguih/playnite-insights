import { GameNoteFactory, SyncQueueFactory } from '@playnite-insights/lib/client';
import { GameNoteRepository } from '../db/gameNotesRepository.svelte';
import { SyncQueueRepository } from '../db/syncQueueRepository.svelte';
import { EventSourceManager } from '../event-source-manager/eventSourceManager.svelte';
import { ServerHeartbeat } from '../event-source-manager/serverHeartbeat.svelte';
import { ServiceWorkerUpdater } from '../sw-updater.svelte';
import { SyncQueue } from '../sync-queue/syncQueue';
import { DateTimeHandler } from '../utils/dateTimeHandler.svelte';
import type { HttpClientSignal, IndexedDbSignal } from './AppData.types';
import { CompanyStore } from './stores/companyStore.svelte';
import { GameNoteStore } from './stores/gameNoteStore.svelte';
import { GameSessionStore } from './stores/gameSessionStore.svelte';
import { GameStore } from './stores/gameStore.svelte';
import { GenreStore } from './stores/genreStore.svelte';
import { LibraryMetricsStore } from './stores/libraryMetricsStore.svelte';
import { PlatformStore } from './stores/platformStore.svelte';
import { ServerTimeStore } from './stores/serverTimeStore.svelte';

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
	httpClientSignal: HttpClientSignal;
};

export class ClientServiceLocator {
	#dateTimeHandler: DateTimeHandler;
	#factory: ClientServiceLocatorFactory;
	#repository: ClientServiceLocatorRepository;
	#serverTimeStore: ServerTimeStore;
	#syncQueue: SyncQueue;
	#eventSourceManager: EventSourceManager;
	#serviceWorkerUpdater: ServiceWorkerUpdater;
	#serverHeartbeat: ServerHeartbeat;
	#gameStore: GameStore;
	#companyStore: CompanyStore;
	#gameSessionStore: GameSessionStore;
	#gameNoteStore: GameNoteStore;
	#libraryMetricsStore: LibraryMetricsStore;
	#genreStore: GenreStore;
	#platformStore: PlatformStore;

	constructor({ indexedDbSignal, httpClientSignal }: ClientServiceLocatorDeps) {
		this.#eventSourceManager = new EventSourceManager();
		this.#serviceWorkerUpdater = new ServiceWorkerUpdater();
		this.#serverHeartbeat = new ServerHeartbeat({ eventSourceManager: this.#eventSourceManager });
		this.#serverTimeStore = new ServerTimeStore({
			httpClientSignal,
			serverHeartbeat: this.#serverHeartbeat,
		});
		this.#dateTimeHandler = new DateTimeHandler({ serverTimeStore: this.#serverTimeStore });
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
		this.#gameStore = new GameStore({ httpClientSignal });
		this.#companyStore = new CompanyStore({ httpClientSignal });
		this.#gameSessionStore = new GameSessionStore({ httpClientSignal });
		this.#gameNoteStore = new GameNoteStore({
			httpClientSignal,
			serverHeartbeat: this.#serverHeartbeat,
			gameNoteRepository: this.#repository.gameNote,
			dateTimeHandler: this.#dateTimeHandler,
		});
		this.#libraryMetricsStore = new LibraryMetricsStore({ httpClientSignal });
		this.#genreStore = new GenreStore({ httpClientSignal });
		this.#platformStore = new PlatformStore({ httpClientSignal });
	}

	loadStoresData = () => {
		this.#gameStore.loadGames();
		this.#companyStore.loadCompanies();
		this.#gameSessionStore.loadRecentSessions();
		this.#libraryMetricsStore.loadLibraryMetrics();
		this.#genreStore.loadGenres();
		this.#platformStore.loadPlatforms();
		this.#serverTimeStore.loadServerTime();
	};

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

	get gameStore() {
		return this.#gameStore;
	}

	get companyStore() {
		return this.#companyStore;
	}

	get gameSessionStore() {
		return this.#gameSessionStore;
	}

	get gameNoteStore() {
		return this.#gameNoteStore;
	}

	get libraryMetricsStore() {
		return this.#libraryMetricsStore;
	}

	get genreStore() {
		return this.#genreStore;
	}

	get platformStore() {
		return this.#platformStore;
	}

	get serverTimeStore() {
		return this.#serverTimeStore;
	}
}
