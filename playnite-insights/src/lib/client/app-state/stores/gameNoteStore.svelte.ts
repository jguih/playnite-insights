import type { GameNoteRepository } from '$lib/client/db/gameNotesRepository.svelte';
import type { ServerHeartbeat } from '$lib/client/event-source-manager/serverHeartbeat.svelte';
import type { DateTimeHandler } from '$lib/client/utils/dateTimeHandler.svelte';
import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
	FetchClientStrategyError,
	getAllGameNotesResponseSchema,
	HttpClientNotSetError,
	JsonStrategy,
	type IFetchClient,
} from '@playnite-insights/lib/client';
import type { HttpClientSignal } from '../AppData.types';

export type GameNoteStoreDeps = {
	httpClientSignal: HttpClientSignal;
	serverHeartbeat: ServerHeartbeat;
	gameNoteRepository: GameNoteRepository;
	dateTimeHandler: DateTimeHandler;
};

export class GameNoteStore {
	#httpClientSignal: GameNoteStoreDeps['httpClientSignal'];
	#serverHeartbeat: GameNoteStoreDeps['serverHeartbeat'];
	#gameNoteRepository: GameNoteStoreDeps['gameNoteRepository'];
	#dateTimeHandler: GameNoteStoreDeps['dateTimeHandler'];

	constructor({
		httpClientSignal,
		serverHeartbeat,
		gameNoteRepository,
		dateTimeHandler,
	}: GameNoteStoreDeps) {
		this.#httpClientSignal = httpClientSignal;
		this.#serverHeartbeat = serverHeartbeat;
		this.#gameNoteRepository = gameNoteRepository;
		this.#dateTimeHandler = dateTimeHandler;
	}

	#withHttpClient = <T>(cb: (props: { client: IFetchClient }) => Promise<T>): Promise<T> => {
		const client = this.#httpClientSignal.client;
		if (!client) throw new HttpClientNotSetError();
		return cb({ client });
	};

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
			return await this.#withHttpClient(async ({ client }) => {
				const lastSync = this.#getLastServerSync();
				const notes = await client.httpGetAsync({
					endpoint: `/api/note${lastSync ? `?lastSync=${lastSync}` : ''}`,
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
			handleClientErrors(err, `[loadNotesFromServerAsync] failed to fetch /api/note`);
			return { notes: null, success: false };
		}
	};
}
