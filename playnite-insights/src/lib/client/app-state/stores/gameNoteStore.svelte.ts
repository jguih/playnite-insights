import type { GameNoteRepository } from '$lib/client/db/gameNotesRepository.svelte';
import type { ServerHeartbeat } from '$lib/client/event-source-manager/serverHeartbeat.svelte';
import type { IDateTimeHandler } from '$lib/client/utils/dateTimeHandler.svelte';
import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
	FetchClientStrategyError,
	getAllGameNotesResponseSchema,
	JsonStrategy,
} from '@playnite-insights/lib/client';
import { ApiDataStore, type ApiDataStoreDeps } from './apiDataStore.svelte';

export type GameNoteStoreDeps = ApiDataStoreDeps & {
	serverHeartbeat: ServerHeartbeat;
	gameNoteRepository: GameNoteRepository;
	dateTimeHandler: IDateTimeHandler;
};

export class GameNoteStore extends ApiDataStore {
	#serverHeartbeat: GameNoteStoreDeps['serverHeartbeat'];
	#gameNoteRepository: GameNoteStoreDeps['gameNoteRepository'];
	#dateTimeHandler: GameNoteStoreDeps['dateTimeHandler'];

	constructor({
		httpClient,
		serverHeartbeat,
		gameNoteRepository,
		dateTimeHandler,
	}: GameNoteStoreDeps) {
		super({ httpClient });
		this.#serverHeartbeat = serverHeartbeat;
		this.#gameNoteRepository = gameNoteRepository;
		this.#dateTimeHandler = dateTimeHandler;
	}

	#getLastServerSync = (): string | null => {
		const lastSync = localStorage.getItem('lastServerSync');
		if (!lastSync) return null;
		if (isNaN(Date.parse(lastSync))) return null;
		return new Date(lastSync).toISOString();
	};

	#setLastServerSync = () => {
		const serverNow = this.#dateTimeHandler.getUtcNow();
		localStorage.setItem('lastServerSync', new Date(serverNow).toISOString());
	};

	#clearLastServerSync = () => {
		localStorage.setItem('lastServerSync', '');
	};

	loadNotesFromServerAsync = async (override?: boolean) => {
		if (!this.#serverHeartbeat.isAlive) return { notes: null, success: true };
		if (override) this.#clearLastServerSync();
		try {
			return await this.withHttpClient(async ({ client }) => {
				const lastSync = this.#getLastServerSync();
				const notes = await client.httpGetAsync({
					endpoint: `/api/sync/note${lastSync ? `?lastSync=${lastSync}` : ''}`,
					strategy: new JsonStrategy(getAllGameNotesResponseSchema),
				});
				this.#setLastServerSync();
				await this.#gameNoteRepository.upsertOrDeleteManyAsync(notes, { override });
				return { notes, success: true };
			});
		} catch (err) {
			if (
				err instanceof FetchClientStrategyError &&
				(err.statusCode === 304 || err.statusCode === 204)
			) {
				this.#setLastServerSync();
				return { notes: null, success: true };
			}
			handleClientErrors(err, `[loadNotesFromServerAsync] failed to fetch /api/sync/note`);
			return { notes: null, success: false };
		}
	};
}
