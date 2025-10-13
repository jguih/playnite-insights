import {
	AppClientError,
	EmptyStrategy,
	FetchClientStrategyError,
	HttpClientNotSetError,
	JsonStrategy,
	serverSyncReconciliationResponseSchema,
	type ClientSyncReconciliationCommand,
	type IFetchClient,
} from '@playnite-insights/lib/client';
import type { GameNoteRepository } from '../db/gameNotesRepository.svelte';
import type { KeyValueRepository } from '../db/keyValueRepository.svelte';
import type { ILogService } from '../logService.svelte';

export type SynchronizationServiceDeps = {
	keyValueRepository: KeyValueRepository;
	gameNoteRepository: GameNoteRepository;
	httpClient: IFetchClient | null;
	logService: ILogService;
};

export class SynchronizationService {
	#keyValueRepository: SynchronizationServiceDeps['keyValueRepository'];
	#httpClient: SynchronizationServiceDeps['httpClient'];
	#gameNoteRepository: SynchronizationServiceDeps['gameNoteRepository'];
	#logService: SynchronizationServiceDeps['logService'];
	#syncId: string | null = null;

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
	}

	#withHttpClient = async <T>(cb: (props: { client: IFetchClient }) => Promise<T>): Promise<T> => {
		const client = this.#httpClient;
		if (!client) throw new HttpClientNotSetError();
		return cb({ client });
	};

	#reconcileWithServer = async () => {
		try {
			this.#logService.info(`Reconciliation started`);
			await this.#withHttpClient(async ({ client }) => {
				const notes = await this.#gameNoteRepository.getAllAsync();
				const command: ClientSyncReconciliationCommand = {
					notes,
				};
				const response = await client.httpPostAsync({
					endpoint: '/api/sync',
					strategy: new JsonStrategy(serverSyncReconciliationResponseSchema),
					body: command,
				});
				await this.#keyValueRepository.putAsync({
					keyvalue: { Key: 'sync-id', Value: response.syncId },
				});
				await this.#gameNoteRepository.upsertOrDeleteManyAsync(response.notes);
				this.#logService.success(
					`Reconciliation completed (Processed ${response.notes.length} notes. Stored new SyncId: ${response.syncId})`,
				);
			});
		} catch (error) {
			this.#logService.error(`Reconciliation failed`, error);
			throw new AppClientError(
				{
					code: 'reconciliation_failed',
					message: 'Failed to reconcile local dataset with server.',
				},
				error,
			);
		}
	};

	getSyncId = async (): Promise<string | null> => {
		if (this.#syncId) return this.#syncId;
		const syncId = await this.#keyValueRepository.getAsync({ key: 'sync-id' });
		if (syncId) this.#syncId = syncId;
		return this.#syncId;
	};

	ensureValidLocalSyncId = async (): Promise<void> => {
		try {
			await this.#withHttpClient(async ({ client }) => {
				await client.httpGetAsync({
					endpoint: '/api/sync/check',
					strategy: new EmptyStrategy(),
				});
			});
		} catch (error) {
			const syncCheckFailedError = new AppClientError(
				{ code: 'sync_check_failed', message: 'Failed to verify SyncId with server.' },
				error,
			);
			if (error instanceof FetchClientStrategyError) {
				if (error.statusCode === 409) {
					this.#logService.error(`Client has invalid SyncId`, error);
					await this.#reconcileWithServer();
					throw new AppClientError(
						{
							code: 'invalid_syncid',
							message: 'Local SyncId was invalid and reconciliation was triggered.',
						},
						error,
					);
				} else if (error.statusCode >= 500) {
					this.#logService.error(`Failed to verify SyncId with server`, error);
					throw syncCheckFailedError;
				}
				this.#logService.debug(`Failed to verify SyncId with server: ${error.message}`);
				throw syncCheckFailedError;
			} else {
				this.#logService.error(`Unexpected error during SyncId check`, error);
				throw syncCheckFailedError;
			}
		}
	};
}
