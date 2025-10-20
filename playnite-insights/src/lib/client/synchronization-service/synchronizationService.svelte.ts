import {
	AppClientError,
	EmptyStrategy,
	FetchClientStrategyError,
	JsonStrategy,
	serverSyncReconciliationResponseSchema,
	type ClientSyncReconciliationCommand,
	type IFetchClient,
} from '@playnite-insights/lib/client';
import { IndexedDBNotInitializedError } from '../db/errors/indexeddbNotInitialized';
import type { GameNoteRepository } from '../db/gameNotesRepository.svelte';
import type { KeyValueRepository } from '../db/keyValueRepository.svelte';
import type { ILogService } from '../logService.svelte';

export type SynchronizationServiceDeps = {
	keyValueRepository: KeyValueRepository;
	gameNoteRepository: GameNoteRepository;
	httpClient: IFetchClient;
	logService: ILogService;
};

export interface ISynchronizationService {
	ensureValidLocalSyncId: (deps: {
		onFinishReconcile?: () => void;
		/** If `true` the reconcile function will not run in background and any errors will wait before being thrown */
		waitForReconcile?: boolean;
	}) => Promise<void>;
}

export class SynchronizationService {
	#keyValueRepository: SynchronizationServiceDeps['keyValueRepository'];
	#httpClient: SynchronizationServiceDeps['httpClient'];
	#gameNoteRepository: SynchronizationServiceDeps['gameNoteRepository'];
	#logService: SynchronizationServiceDeps['logService'];
	#syncIdSignal: string | null;

	constructor({
		keyValueRepository,
		httpClient,
		gameNoteRepository,
		logService,
	}: SynchronizationServiceDeps) {
		this.#keyValueRepository = keyValueRepository;
		this.#httpClient = httpClient;
		this.#gameNoteRepository = gameNoteRepository;
		this.#logService = logService;
		this.#syncIdSignal = $state(null);
	}

	#reconcileWithServer = async () => {
		try {
			this.#logService.info(`Reconciliation started`);
			const notes = await this.#gameNoteRepository.getAllAsync();
			const command: ClientSyncReconciliationCommand = {
				notes,
			};
			const response = await this.#httpClient.httpPostAsync({
				endpoint: '/api/sync',
				strategy: new JsonStrategy(serverSyncReconciliationResponseSchema),
				body: command,
			});
			await this.#keyValueRepository.putAsync({
				keyvalue: { Key: 'sync-id', Value: response.syncId },
			});
			this.#syncIdSignal = response.syncId;
			await this.#gameNoteRepository.upsertOrDeleteManyAsync(response.notes);
			this.#logService.success(
				`Reconciliation completed (Processed ${response.notes.length} notes. Stored new SyncId: ${response.syncId})`,
			);
		} catch (error) {
			if (error instanceof IndexedDBNotInitializedError) {
				this.#logService.error(
					`IndexedDb not initialized while reconciling server dataset: ${error.message}`,
				);
				throw new AppClientError(
					{
						code: 'indexeddb_not_initialized',
						message: 'IndexedDb not initialized while reconciling server dataset',
					},
					error,
				);
			} else if (error instanceof DOMException) {
				this.#logService.error(
					`DOMException while reconciling server dataset (${error.name}): ${error.message}`,
					error,
				);
				throw new AppClientError(
					{
						code: 'dom_exception',
						message: `DOMException while reconciling server dataset`,
					},
					error,
				);
			} else if (error instanceof FetchClientStrategyError) {
				if (error.statusCode >= 500) {
					this.#logService.error(
						`HTTP request error while reconciling server dataset: ${error.message}`,
						error,
					);
					throw new AppClientError(
						{
							code: 'server_error',
							message: `HTTP request error while reconciling server dataset`,
						},
						error,
					);
				} else {
					this.#logService.debug(`HTTP request error while reconciling server dataset`);
					throw new AppClientError(
						{
							code: 'reconciliation_failed',
							message: `HTTP request error while reconciling server dataset`,
						},
						error,
					);
				}
			}
			this.#logService.error(`Unknown error while reconciling with server`, error);
			throw new AppClientError(
				{
					code: 'reconciliation_failed',
					message: 'Unknown error while reconciling with server',
				},
				error,
			);
		}
	};

	getSyncId = async (): Promise<string | null> => {
		if (this.#syncIdSignal) return this.#syncIdSignal;
		const syncId = await this.#keyValueRepository.getAsync({ key: 'sync-id' });
		if (syncId) this.#syncIdSignal = syncId;
		return this.#syncIdSignal;
	};

	get syncIdSignal() {
		return this.#syncIdSignal;
	}

	ensureValidLocalSyncId = async (
		deps: { onFinishReconcile?: () => void; waitForReconcile?: boolean } = {},
	): Promise<void> => {
		try {
			await this.#httpClient.httpGetAsync({
				endpoint: '/api/sync/check',
				strategy: new EmptyStrategy(),
			});
		} catch (error) {
			if (error instanceof FetchClientStrategyError) {
				if (error.statusCode === 409) {
					this.#logService.error(`Invalid SyncId detected`, error);
					if (deps.waitForReconcile) await this.#reconcileWithServer().then(deps.onFinishReconcile);
					else this.#reconcileWithServer().then(deps.onFinishReconcile);
					throw new AppClientError(
						{
							code: 'invalid_syncid',
							message: 'Local SyncId was invalid and reconciliation was triggered.',
						},
						error,
					);
				}
				if (error.statusCode >= 500) {
					this.#logService.error(
						`HTTP request error while validating local SyncId: ${error.message}`,
						error,
					);
					throw new AppClientError(
						{
							code: 'server_error',
							message: 'HTTP request error while validating local SyncId',
						},
						error,
					);
				} else {
					this.#logService.debug(
						`HTTP request error while validating local SyncId: ${error.message}`,
					);
					throw new AppClientError(
						{
							code: 'sync_check_failed',
							message: 'HTTP request error while validating local SyncId',
						},
						error,
					);
				}
			}
			this.#logService.error(`Unknown error while validating local SyncId`, error);
			throw new AppClientError(
				{ code: 'sync_check_failed', message: 'Unknown error while validating local SyncId' },
				error,
			);
		}
	};
}
