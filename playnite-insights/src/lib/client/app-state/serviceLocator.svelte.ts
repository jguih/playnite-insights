import { browser } from '$app/environment';
import {
	FetchClient,
	GameNoteFactory,
	SyncQueueFactory,
	type IFetchClient,
} from '@playnite-insights/lib/client';
import { GameNoteRepository } from '../db/gameNotesRepository.svelte';
import { KeyValueRepository } from '../db/keyValueRepository.svelte';
import { SyncQueueRepository } from '../db/syncQueueRepository.svelte';
import { EventSourceManager } from '../event-source-manager/eventSourceManager.svelte';
import { ServerHeartbeat } from '../event-source-manager/serverHeartbeat.svelte';
import { InstanceManager } from '../instanceManager.svelte';
import { ServiceWorkerManager } from '../serviceWorkerManager.svelte';
import { SyncQueue } from '../sync-queue/syncQueue';
import { DateTimeHandler } from '../utils/dateTimeHandler.svelte';
import { IndexedDbManager, type IndexedDbSignal } from './indexeddbManager.svelte';
import { CompanyStore } from './stores/companyStore.svelte';
import { GameNoteStore } from './stores/gameNoteStore.svelte';
import { GameSessionStore } from './stores/gameSessionStore.svelte';
import { GameStore } from './stores/gameStore.svelte';
import { GenreStore } from './stores/genreStore.svelte';
import { LibraryMetricsStore } from './stores/libraryMetricsStore.svelte';
import { PlatformStore } from './stores/platformStore.svelte';
import { ServerTimeStore } from './stores/serverTimeStore.svelte';

export class ClientServiceLocator {
	// Services
	#indexeddbManager: IndexedDbManager | null = null;
	#dateTimeHandler: DateTimeHandler | null = null;
	#syncQueue: SyncQueue | null = null;
	#eventSourceManager: EventSourceManager | null = null;
	#serviceWorkerManager: ServiceWorkerManager | null = null;
	#serverHeartbeat: ServerHeartbeat | null = null;
	#httpClient: IFetchClient | null = null;
	#instanceManager: InstanceManager | null = null;
	// Stores
	#gameStore: GameStore | null = null;
	#serverTimeStore: ServerTimeStore | null = null;
	#companyStore: CompanyStore | null = null;
	#gameSessionStore: GameSessionStore | null = null;
	#gameNoteStore: GameNoteStore | null = null;
	#libraryMetricsStore: LibraryMetricsStore | null = null;
	#genreStore: GenreStore | null = null;
	#platformStore: PlatformStore | null = null;
	// Repositories
	#gameNoteRepository: GameNoteRepository | null = null;
	#syncQueueRepository: SyncQueueRepository | null = null;
	#keyValueRepository: KeyValueRepository | null = null;
	// Factories
	#syncQueueFactory: SyncQueueFactory | null = null;
	#gameNoteFactory: GameNoteFactory | null = null;
	#sessionId: string | null = null;

	constructor() {}

	loadStoresData = () => {
		this.gameStore.loadGames();
		this.companyStore.loadCompanies();
		this.gameSessionStore.loadRecentSessions();
		this.libraryMetricsStore.loadLibraryMetrics();
		this.genreStore.loadGenres();
		this.platformStore.loadPlatforms();
		this.serverTimeStore.loadServerTime();
	};

	#getSessionId = async (): Promise<string | null> => {
		if (this.#sessionId) return this.#sessionId;
		const sessionId = await this.keyValueRepository.getAsync({ key: 'session-id' });
		if (sessionId) this.#sessionId = sessionId.Value;
		return this.#sessionId;
	};

	#getHttpClientGlobalHeaders = async (): Promise<Headers> => {
		const headers = new Headers();
		const sessionId = await this.#getSessionId();
		if (sessionId) headers.set('Authorization', `Bearer ${sessionId}`);
		return headers;
	};

	get httpClient(): IFetchClient | null {
		if (!this.#httpClient && browser) {
			this.#httpClient = new FetchClient({
				url: window.location.origin,
				globalHeaders: this.#getHttpClientGlobalHeaders,
			});
		}
		return this.#httpClient;
	}
	get dbSignal(): IndexedDbSignal {
		if (!this.#indexeddbManager) {
			this.#indexeddbManager = new IndexedDbManager({
				onOpen: () => this.gameNoteStore.loadNotesFromServerAsync(),
			});
		}
		return this.#indexeddbManager.dbSignal;
	}
	get dateTimeHandler(): DateTimeHandler {
		if (!this.#dateTimeHandler) {
			this.#dateTimeHandler = new DateTimeHandler({ serverTimeStore: this.serverTimeStore });
		}
		return this.#dateTimeHandler;
	}
	get syncQueue(): SyncQueue {
		if (!this.#syncQueue) {
			this.#syncQueue = new SyncQueue({
				indexedDbSignal: this.dbSignal,
				syncQueueRepository: this.syncQueueRepository,
				httpClient: this.#httpClient,
			});
		}
		return this.#syncQueue;
	}
	get eventSourceManager(): EventSourceManager {
		if (!this.#eventSourceManager) {
			this.#eventSourceManager = new EventSourceManager();
		}
		return this.#eventSourceManager;
	}
	get serviceWorkerManager(): ServiceWorkerManager {
		if (!this.#serviceWorkerManager) {
			this.#serviceWorkerManager = new ServiceWorkerManager();
		}
		return this.#serviceWorkerManager;
	}
	get serverHeartbeat(): ServerHeartbeat {
		if (!this.#serverHeartbeat) {
			this.#serverHeartbeat = new ServerHeartbeat({ eventSourceManager: this.eventSourceManager });
		}
		return this.#serverHeartbeat;
	}
	get instanceManager(): InstanceManager {
		if (!this.#instanceManager) {
			this.#instanceManager = new InstanceManager({
				httpClient: this.httpClient,
				keyValueRepository: this.keyValueRepository,
			});
		}
		return this.#instanceManager;
	}

	// Repositories
	get gameNoteRepository(): GameNoteRepository {
		if (!this.#gameNoteRepository) {
			this.#gameNoteRepository = new GameNoteRepository({
				dateTimeHandler: this.dateTimeHandler,
				indexedDbSignal: this.dbSignal,
				syncQueueFactory: this.syncQueueFactory,
			});
		}
		return this.#gameNoteRepository;
	}
	get syncQueueRepository(): SyncQueueRepository {
		if (!this.#syncQueueRepository) {
			this.#syncQueueRepository = new SyncQueueRepository({ indexedDbSignal: this.dbSignal });
		}
		return this.#syncQueueRepository;
	}
	get keyValueRepository(): KeyValueRepository {
		if (!this.#keyValueRepository) {
			this.#keyValueRepository = new KeyValueRepository({ indexedDbSignal: this.dbSignal });
		}
		return this.#keyValueRepository;
	}

	// Factories
	get syncQueueFactory(): SyncQueueFactory {
		if (!this.#syncQueueFactory) {
			this.#syncQueueFactory = new SyncQueueFactory();
		}
		return this.#syncQueueFactory;
	}
	get gameNoteFactory(): GameNoteFactory {
		if (!this.#gameNoteFactory) {
			this.#gameNoteFactory = new GameNoteFactory();
		}
		return this.#gameNoteFactory;
	}

	// Stores
	get gameStore(): GameStore {
		if (!this.#gameStore) {
			this.#gameStore = new GameStore({ httpClient: this.httpClient });
		}
		return this.#gameStore;
	}
	get companyStore(): CompanyStore {
		if (!this.#companyStore) {
			this.#companyStore = new CompanyStore({ httpClient: this.httpClient });
		}
		return this.#companyStore;
	}
	get gameSessionStore(): GameSessionStore {
		if (!this.#gameSessionStore) {
			this.#gameSessionStore = new GameSessionStore({ httpClient: this.httpClient });
		}
		return this.#gameSessionStore;
	}
	get gameNoteStore(): GameNoteStore {
		if (!this.#gameNoteStore) {
			this.#gameNoteStore = new GameNoteStore({
				httpClient: this.httpClient,
				serverHeartbeat: this.serverHeartbeat,
				dateTimeHandler: this.dateTimeHandler,
				gameNoteRepository: this.gameNoteRepository,
			});
		}
		return this.#gameNoteStore;
	}
	get libraryMetricsStore(): LibraryMetricsStore {
		if (!this.#libraryMetricsStore) {
			this.#libraryMetricsStore = new LibraryMetricsStore({ httpClient: this.httpClient });
		}
		return this.#libraryMetricsStore;
	}
	get genreStore(): GenreStore {
		if (!this.#genreStore) {
			this.#genreStore = new GenreStore({ httpClient: this.httpClient });
		}
		return this.#genreStore;
	}
	get platformStore(): PlatformStore {
		if (!this.#platformStore) {
			this.#platformStore = new PlatformStore({ httpClient: this.httpClient });
		}
		return this.#platformStore;
	}
	get serverTimeStore(): ServerTimeStore {
		if (!this.#serverTimeStore) {
			this.#serverTimeStore = new ServerTimeStore({
				httpClient: this.httpClient,
				serverHeartbeat: this.serverHeartbeat,
			});
		}
		return this.#serverTimeStore;
	}
}

export const locator = new ClientServiceLocator();

if (browser) {
	locator.loadStoresData();
}
