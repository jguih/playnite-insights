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

export type SynchronizationServiceDeps = {
	keyValueRepository: KeyValueRepository;
	gameNoteRepository: GameNoteRepository;
	httpClient: IFetchClient | null;
};

export class SynchronizationService {
	#keyValueRepository: SynchronizationServiceDeps['keyValueRepository'];
	#httpClient: SynchronizationServiceDeps['httpClient'];
	#gameNoteRepository: SynchronizationServiceDeps['gameNoteRepository'];
	#syncId: string | null = null;

	constructor({ keyValueRepository, httpClient, gameNoteRepository }: SynchronizationServiceDeps) {
		this.#keyValueRepository = keyValueRepository;
		this.#httpClient = httpClient;
		this.#gameNoteRepository = gameNoteRepository;
	}

	#withHttpClient = async <T>(cb: (props: { client: IFetchClient }) => Promise<T>): Promise<T> => {
		const client = this.#httpClient;
		if (!client) throw new HttpClientNotSetError();
		return cb({ client });
	};

	#reconcileWithServer = async () => {
		try {
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
			});
		} catch (error) {
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
			if (error instanceof FetchClientStrategyError && error.statusCode === 409) {
				// Invalid SyncId
				await this.#reconcileWithServer();
				throw new AppClientError(
					{
						code: 'invalid_syncid',
						message: 'Local SyncId was invalid and reconciliation was triggered.',
					},
					error,
				);
			}
			throw new AppClientError(
				{ code: 'sync_check_failed', message: 'Failed to verify SyncId with server.' },
				error,
			);
		}
	};
}
