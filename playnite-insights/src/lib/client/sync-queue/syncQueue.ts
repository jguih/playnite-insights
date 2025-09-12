import {
	createGameNoteCommandSchema,
	updateGameNoteResponseSchema,
	type SyncQueueItem,
} from '@playnite-insights/lib/client';
import type { HttpClientSignal } from '../app-state/AppData.types';
import type { GameNoteRepository } from '../db/gameNotesRepository.svelte';
import type { SyncQueueRepository } from '../db/syncQueueRepository.svelte';
import { HttpClientNotSetError } from '../fetch-client/error/httpClientNotSetError';
import type { FetchClient } from '../fetch-client/fetchClient';
import { JsonStrategy } from '../fetch-client/jsonStrategy';

export type SyncQueueDeps = {
	syncQueueRepository: SyncQueueRepository;
	gameNoteRepository: GameNoteRepository;
	httpClientSignal: HttpClientSignal;
};

export class SyncQueue {
	#syncQueueRepository: SyncQueueDeps['syncQueueRepository'];
	#gameNoteRepository: SyncQueueDeps['gameNoteRepository'];
	#httpClientSignal: SyncQueueDeps['httpClientSignal'];

	constructor(deps: SyncQueueDeps) {
		this.#syncQueueRepository = deps.syncQueueRepository;
		this.#gameNoteRepository = deps.gameNoteRepository;
		this.#httpClientSignal = deps.httpClientSignal;
	}

	withHttpClient = async <T>(cb: (props: { client: FetchClient }) => Promise<T>): Promise<T> => {
		const client = this.#httpClientSignal.client;
		if (!client) throw new HttpClientNotSetError();
		return cb({ client });
	};

	private processGameNoteAsync = async (queueItem: SyncQueueItem) => {
		return await this.withHttpClient(async ({ client }) => {
			const note = { ...queueItem.Payload };
			try {
				switch (queueItem.Type) {
					case 'create': {
						const command = createGameNoteCommandSchema.parse(note);
						const createdNote = await client.httpPostAsync({
							endpoint: '/api/note',
							strategy: new JsonStrategy(updateGameNoteResponseSchema),
							body: command,
						});
						await this.#gameNoteRepository.putAsync({ note: createdNote });
						await this.#syncQueueRepository.removeAsync(queueItem.Id!);
						break;
					}
					case 'update': {
						break;
					}
					case 'delete': {
						break;
					}
				}
			} catch (error) {
				const item = { ...queueItem };
				item.Status = 'failed';
				await this.#syncQueueRepository.putAsync({ queueItem: item });
				throw error;
			}
		});
	};

	processQueueAsync = async () => {
		const queueItems = await this.#syncQueueRepository.getAllAsync();
		for (const queueItem of queueItems) {
			switch (queueItem.Entity) {
				case 'gameNote':
					await this.processGameNoteAsync(queueItem);
			}
		}
	};
}
