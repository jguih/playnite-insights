import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
	getAllGamesResponseSchema,
	HttpClientNotSetError,
	JsonStrategy,
	type GetAllGamesResponse,
	type IFetchClient,
} from '@playnite-insights/lib/client';
import type { HttpClientSignal } from '../AppData.types';

export type GameStoreDeps = {
	httpClientSignal: HttpClientSignal;
};

export type GameListSignal = {
	list: GetAllGamesResponse | null;
	isLoading: boolean;
};

export class GameStore {
	#httpClientSignal: GameStoreDeps['httpClientSignal'];
	#dataSignal: GameListSignal;

	constructor({ httpClientSignal }: GameStoreDeps) {
		this.#httpClientSignal = httpClientSignal;
		this.#dataSignal = $state({ list: null, isLoading: false });
	}

	#withHttpClient = <T>(cb: (props: { client: IFetchClient }) => Promise<T>): Promise<T> => {
		const client = this.#httpClientSignal.client;
		if (!client) throw new HttpClientNotSetError();
		return cb({ client });
	};

	loadGames = async () => {
		try {
			return await this.#withHttpClient(async ({ client }) => {
				this.#dataSignal.isLoading = true;
				const result = await client.httpGetAsync({
					endpoint: '/api/game',
					strategy: new JsonStrategy(getAllGamesResponseSchema),
				});
				this.#dataSignal.list = result;
				return result;
			});
		} catch (err) {
			handleClientErrors(err, `[loadGames] failed to fetch /api/game`);
			return null;
		} finally {
			this.#dataSignal.isLoading = false;
		}
	};

	get gameList() {
		return this.#dataSignal.list;
	}

	get isLoading() {
		return this.#dataSignal.isLoading;
	}
}
