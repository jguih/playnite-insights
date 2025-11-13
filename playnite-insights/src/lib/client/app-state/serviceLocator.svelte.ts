import {
	FetchClient,
	GameNoteFactory,
	syncIdHeader,
	SyncQueueFactory,
	type IFetchClient,
} from '@playnite-insights/lib/client';
import { getContext, setContext } from 'svelte';
import { AuthService } from '../auth-service/authService.svelte';
import { GameNoteRepository } from '../db/gameNotesRepository.svelte';
import { KeyValueRepository } from '../db/keyValueRepository.svelte';
import { SyncQueueRepository } from '../db/syncQueueRepository.svelte';
import { EventSourceManager } from '../event-source-manager/eventSourceManager.svelte';
import { ServerHeartbeat } from '../event-source-manager/serverHeartbeat.svelte';
import { InstanceManager } from '../instanceManager.svelte';
import { LogService, type ILogService } from '../logService.svelte';
import { ServiceWorkerManager } from '../serviceWorkerManager.svelte';
import { SyncQueue } from '../sync-queue/syncQueue.svelte';
import { SynchronizationService } from '../synchronization-service/synchronizationService.svelte';
import { DateTimeHandler, type IDateTimeHandler } from '../utils/dateTimeHandler.svelte';
import {
	IndexedDbManager,
	type IIndexedDbManager,
	type IndexedDbSignal,
} from './indexeddbManager.svelte';
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
	protected _indexeddbManager: IIndexedDbManager | null = null;
	protected _dateTimeHandler: IDateTimeHandler | null = null;
	protected _syncQueue: SyncQueue | null = null;
	protected _eventSourceManager: EventSourceManager | null = null;
	protected _serviceWorkerManager: ServiceWorkerManager | null = null;
	protected _serverHeartbeat: ServerHeartbeat | null = null;
	protected _httpClient: IFetchClient | null = null;
	protected _instanceManager: InstanceManager | null = null;
	protected _syncService: SynchronizationService | null = null;
	protected _authService: AuthService | null = null;
	protected _logService: ILogService | null = null;

	get indexeddbManager(): IIndexedDbManager {
		if (!this._indexeddbManager) {
			this._indexeddbManager = new IndexedDbManager();
		}
		return this._indexeddbManager;
	}
	set indexeddbManager(manager: IIndexedDbManager) {
		this._indexeddbManager = manager;
	}

	get dateTimeHandler(): IDateTimeHandler {
		if (!this._dateTimeHandler) {
			this._dateTimeHandler = new DateTimeHandler({ serverTimeStore: this.serverTimeStore });
		}
		return this._dateTimeHandler;
	}
	set dateTimeHandler(handler: IDateTimeHandler) {
		this._dateTimeHandler = handler;
	}

	get dbSignal(): IndexedDbSignal {
		return this.indexeddbManager.dbSignal;
	}

	get syncQueue(): SyncQueue {
		if (!this._syncQueue) {
			this._syncQueue = new SyncQueue({
				indexedDbSignal: this.dbSignal,
				syncQueueRepository: this.syncQueueRepository,
				httpClient: this.httpClient,
			});
		}
		return this._syncQueue;
	}
	set syncQueue(syncQueue: SyncQueue) {
		this._syncQueue = syncQueue;
	}

	get eventSourceManager(): EventSourceManager {
		if (!this._eventSourceManager) {
			this._eventSourceManager = new EventSourceManager({
				getSessionId: this.authService.getSessionId,
				companyStore: this.companyStore,
				gameSessionStore: this.gameSessionStore,
				gameStore: this.gameStore,
				genreStore: this.genreStore,
				libraryMetricsStore: this.libraryMetricsStore,
				platformStore: this.platformStore,
			});
		}
		return this._eventSourceManager;
	}
	set eventSourceManager(manager: EventSourceManager) {
		this._eventSourceManager = manager;
	}

	get serviceWorkerManager(): ServiceWorkerManager {
		if (!this._serviceWorkerManager) {
			this._serviceWorkerManager = new ServiceWorkerManager({
				companyStore: this.companyStore,
				gameSessionStore: this.gameSessionStore,
				gameStore: this.gameStore,
				genreStore: this.genreStore,
				libraryMetricsStore: this.libraryMetricsStore,
				platformStore: this.platformStore,
				screenshotStore: this.screenshotStore,
			});
		}
		return this._serviceWorkerManager;
	}
	set serviceWorkerManager(manager: ServiceWorkerManager) {
		this._serviceWorkerManager = manager;
	}

	get serverHeartbeat(): ServerHeartbeat {
		if (!this._serverHeartbeat) {
			this._serverHeartbeat = new ServerHeartbeat({ eventSourceManager: this.eventSourceManager });
		}
		return this._serverHeartbeat;
	}
	set serverHeartbeat(serverHeartbeat: ServerHeartbeat) {
		this._serverHeartbeat = serverHeartbeat;
	}

	get httpClient(): IFetchClient {
		if (!this._httpClient) {
			this._httpClient = new FetchClient({
				url: window.location.origin,
				globalHeaders: this.#getHttpClientGlobalHeaders,
			});
		}
		return this._httpClient;
	}
	set httpClient(client: IFetchClient) {
		this._httpClient = client;
	}

	get instanceManager(): InstanceManager {
		if (!this._instanceManager) {
			this._instanceManager = new InstanceManager({
				httpClient: this.httpClient,
				keyValueRepository: this.keyValueRepository,
				logService: this.logService,
			});
		}
		return this._instanceManager;
	}
	set instanceManager(manager: InstanceManager) {
		this._instanceManager = manager;
	}

	get syncService(): SynchronizationService {
		if (!this._syncService) {
			this._syncService = new SynchronizationService({
				httpClient: this.httpClient,
				keyValueRepository: this.keyValueRepository,
				gameNoteRepository: this.gameNoteRepository,
				logService: this.logService,
			});
		}
		return this._syncService;
	}

	get authService(): AuthService {
		if (!this._authService) {
			this._authService = new AuthService({
				keyValueRepository: this.keyValueRepository,
			});
		}
		return this._authService;
	}

	get logService(): ILogService {
		if (!this._logService) {
			this._logService = new LogService();
		}
		return this._logService;
	}
	set logService(service: ILogService) {
		this._logService = service;
	}

	// Stores
	protected _gameStore: GameStore | null = null;
	protected _serverTimeStore: ServerTimeStore | null = null;
	protected _companyStore: CompanyStore | null = null;
	protected _gameSessionStore: GameSessionStore | null = null;
	protected _gameNoteStore: GameNoteStore | null = null;
	protected _libraryMetricsStore: LibraryMetricsStore | null = null;
	protected _genreStore: GenreStore | null = null;
	protected _platformStore: PlatformStore | null = null;
	protected _screenshotStore: ScreenshotStore | null = null;
	protected _extensionRegistrationStore: ExtensionRegistrationStore | null = null;
	protected _applicationSettingsStore: ApplicationSettingsStore | null = null;
	// Repositories
	protected _gameNoteRepository: GameNoteRepository | null = null;
	protected _syncQueueRepository: SyncQueueRepository | null = null;
	protected _keyValueRepository: KeyValueRepository | null = null;
	// Factories
	protected _syncQueueFactory: SyncQueueFactory | null = null;
	protected _gameNoteFactory: GameNoteFactory | null = null;

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

	#getHttpClientGlobalHeaders = async (): Promise<Headers> => {
		const headers = new Headers();
		const sessionId = await this.authService.getSessionId();
		const syncId = await this.syncService.getSyncId();
		if (sessionId) headers.set('Authorization', `Bearer ${sessionId}`);
		if (syncId) headers.set(syncIdHeader, syncId);
		return headers;
	};

	// Repositories
	get gameNoteRepository(): GameNoteRepository {
		if (!this._gameNoteRepository) {
			this._gameNoteRepository = new GameNoteRepository({
				dateTimeHandler: this.dateTimeHandler,
				indexedDbSignal: this.dbSignal,
				syncQueueFactory: this.syncQueueFactory,
			});
		}
		return this._gameNoteRepository;
	}
	get syncQueueRepository(): SyncQueueRepository {
		if (!this._syncQueueRepository) {
			this._syncQueueRepository = new SyncQueueRepository({ indexedDbSignal: this.dbSignal });
		}
		return this._syncQueueRepository;
	}
	get keyValueRepository(): KeyValueRepository {
		if (!this._keyValueRepository) {
			this._keyValueRepository = new KeyValueRepository({ indexedDbSignal: this.dbSignal });
		}
		return this._keyValueRepository;
	}

	// Factories
	get syncQueueFactory(): SyncQueueFactory {
		if (!this._syncQueueFactory) {
			this._syncQueueFactory = new SyncQueueFactory();
		}
		return this._syncQueueFactory;
	}
	get gameNoteFactory(): GameNoteFactory {
		if (!this._gameNoteFactory) {
			this._gameNoteFactory = new GameNoteFactory();
		}
		return this._gameNoteFactory;
	}

	// Stores
	get gameStore(): GameStore {
		if (!this._gameStore) {
			this._gameStore = new GameStore({
				httpClient: this.httpClient,
				applicationSettingsStore: this.applicationSettingsStore,
			});
		}
		return this._gameStore;
	}
	get companyStore(): CompanyStore {
		if (!this._companyStore) {
			this._companyStore = new CompanyStore({ httpClient: this.httpClient });
		}
		return this._companyStore;
	}
	get gameSessionStore(): GameSessionStore {
		if (!this._gameSessionStore) {
			this._gameSessionStore = new GameSessionStore({ httpClient: this.httpClient });
		}
		return this._gameSessionStore;
	}
	get gameNoteStore(): GameNoteStore {
		if (!this._gameNoteStore) {
			this._gameNoteStore = new GameNoteStore({
				httpClient: this.httpClient,
				serverHeartbeat: this.serverHeartbeat,
				dateTimeHandler: this.dateTimeHandler,
				gameNoteRepository: this.gameNoteRepository,
			});
		}
		return this._gameNoteStore;
	}
	get libraryMetricsStore(): LibraryMetricsStore {
		if (!this._libraryMetricsStore) {
			this._libraryMetricsStore = new LibraryMetricsStore({ httpClient: this.httpClient });
		}
		return this._libraryMetricsStore;
	}
	get genreStore(): GenreStore {
		if (!this._genreStore) {
			this._genreStore = new GenreStore({ httpClient: this.httpClient });
		}
		return this._genreStore;
	}
	get platformStore(): PlatformStore {
		if (!this._platformStore) {
			this._platformStore = new PlatformStore({ httpClient: this.httpClient });
		}
		return this._platformStore;
	}
	get serverTimeStore(): ServerTimeStore {
		if (!this._serverTimeStore) {
			this._serverTimeStore = new ServerTimeStore({
				httpClient: this.httpClient,
				serverHeartbeat: this.serverHeartbeat,
			});
		}
		return this._serverTimeStore;
	}
	get screenshotStore(): ScreenshotStore {
		if (!this._screenshotStore) {
			this._screenshotStore = new ScreenshotStore({ httpClient: this.httpClient });
		}
		return this._screenshotStore;
	}
	get extensionRegistrationStore(): ExtensionRegistrationStore {
		if (!this._extensionRegistrationStore) {
			this._extensionRegistrationStore = new ExtensionRegistrationStore({
				httpClient: this.httpClient,
			});
		}
		return this._extensionRegistrationStore;
	}
	get applicationSettingsStore(): ApplicationSettingsStore {
		if (!this._applicationSettingsStore) {
			this._applicationSettingsStore = new ApplicationSettingsStore({
				keyValueRepository: this.keyValueRepository,
				logService: this.logService,
			});
		}
		return this._applicationSettingsStore;
	}
}

const CONTEXT_KEY = 'locator';

export const setLocatorContext = (locator: ClientServiceLocator) => {
	setContext(CONTEXT_KEY, locator);
};

export const getLocatorContext = (): ClientServiceLocator => {
	return getContext(CONTEXT_KEY) as ClientServiceLocator;
};
