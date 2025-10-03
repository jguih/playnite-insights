import { browser } from '$app/environment';
import {
	FetchClient,
	GameNoteFactory,
	syncIdHeader,
	SyncQueueFactory,
	type IFetchClient,
} from '@playnite-insights/lib/client';
import { getContext, setContext } from 'svelte';
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
import { ApplicationSettingsStore } from './stores/applicationSettingsStore.svelte';
import { CompanyStore } from './stores/companyStore.svelte';
import { ExtensionRegistrationStore } from './stores/extensionRegistrationStore.svelte';
import { GameNoteStore } from './stores/gameNoteStore.svelte';
import { GameSessionStore } from './stores/gameSessionStore.svelte';
import { GameStore } from './stores/gameStore.svelte';
import { GenreStore } from './stores/genreStore.svelte';
import { LibraryMetricsStore } from './stores/libraryMetricsStore.svelte';
import { PlatformStore } from './stores/platformStore.svelte';
import { ScreenshotStore } from './stores/screenshotStore.svelte';
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
	#screenshotStore: ScreenshotStore | null = null;
	#extensionRegistrationStore: ExtensionRegistrationStore | null = null;
	#applicationSettingsStore: ApplicationSettingsStore | null = null;
	// Repositories
	#gameNoteRepository: GameNoteRepository | null = null;
	#syncQueueRepository: SyncQueueRepository | null = null;
	#keyValueRepository: KeyValueRepository | null = null;
	// Factories
	#syncQueueFactory: SyncQueueFactory | null = null;
	#gameNoteFactory: GameNoteFactory | null = null;

	#sessionId: string | null = null;
	#syncId: string | null = null;

	constructor() {}

	loadStoresData = async () => {
		return await Promise.all([
			this.gameStore.loadGames(),
			this.companyStore.loadCompanies(),
			this.gameSessionStore.loadRecentSessions(),
			this.libraryMetricsStore.loadLibraryMetrics(),
			this.genreStore.loadGenres(),
			this.platformStore.loadPlatforms(),
			this.serverTimeStore.loadServerTime(),
			this.screenshotStore.loadScreenshots(),
		]);
	};

	#getSessionId = async (): Promise<string | null> => {
		if (this.#sessionId) return this.#sessionId;
		const sessionId = await this.keyValueRepository.getAsync({ key: 'session-id' });
		if (sessionId) this.#sessionId = sessionId;
		return this.#sessionId;
	};

	#getSyncId = async (): Promise<string | null> => {
		if (this.#syncId) return this.#syncId;
		const syncId = await this.keyValueRepository.getAsync({ key: 'sync-id' });
		if (syncId) this.#syncId = syncId;
		return this.#syncId;
	};

	#getHttpClientGlobalHeaders = async (): Promise<Headers> => {
		const headers = new Headers();
		const sessionId = await this.#getSessionId();
		const syncId = await this.#getSyncId();
		if (sessionId) headers.set('Authorization', `Bearer ${sessionId}`);
		if (syncId) headers.set(syncIdHeader, syncId);
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
				serverHeartbeat: this.serverHeartbeat,
			});
		}
		return this.#syncQueue;
	}
	get eventSourceManager(): EventSourceManager {
		if (!this.#eventSourceManager) {
			this.#eventSourceManager = new EventSourceManager({
				getSessionId: this.#getSessionId,
				companyStore: this.companyStore,
				gameSessionStore: this.gameSessionStore,
				gameStore: this.gameStore,
				genreStore: this.genreStore,
				libraryMetricsStore: this.libraryMetricsStore,
				platformStore: this.platformStore,
			});
		}
		return this.#eventSourceManager;
	}
	get serviceWorkerManager(): ServiceWorkerManager {
		if (!this.#serviceWorkerManager) {
			this.#serviceWorkerManager = new ServiceWorkerManager({
				companyStore: this.companyStore,
				gameSessionStore: this.gameSessionStore,
				gameStore: this.gameStore,
				genreStore: this.genreStore,
				libraryMetricsStore: this.libraryMetricsStore,
				platformStore: this.platformStore,
				screenshotStore: this.screenshotStore,
			});
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
			this.#gameStore = new GameStore({
				httpClient: this.httpClient,
				applicationSettingsStore: this.applicationSettingsStore,
			});
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
	get screenshotStore(): ScreenshotStore {
		if (!this.#screenshotStore) {
			this.#screenshotStore = new ScreenshotStore({ httpClient: this.httpClient });
		}
		return this.#screenshotStore;
	}
	get extensionRegistrationStore(): ExtensionRegistrationStore {
		if (!this.#extensionRegistrationStore) {
			this.#extensionRegistrationStore = new ExtensionRegistrationStore({
				httpClient: this.httpClient,
			});
		}
		return this.#extensionRegistrationStore;
	}
	get applicationSettingsStore(): ApplicationSettingsStore {
		if (!this.#applicationSettingsStore) {
			this.#applicationSettingsStore = new ApplicationSettingsStore({
				keyValueRepository: this.keyValueRepository,
			});
		}
		return this.#applicationSettingsStore;
	}
}

const CONTEXT_KEY = 'locator';

export const setLocatorContext = (locator: ClientServiceLocator) => {
	setContext(CONTEXT_KEY, locator);
};

export const getLocatorContext = (): ClientServiceLocator => {
	return getContext(CONTEXT_KEY) as ClientServiceLocator;
};
