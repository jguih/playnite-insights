import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
	getAllGamesResponseSchema,
	JsonStrategy,
	type GetAllGamesResponse,
} from '@playnite-insights/lib/client';
import { ApiDataStore, type ApiDataStoreDeps } from './apiDataStore.svelte';

export type GameStoreDeps = ApiDataStoreDeps;

export type GameListSignal = {
	list: GetAllGamesResponse | null;
	isLoading: boolean;
	hasLoaded: boolean;
};

export class GameStore extends ApiDataStore {
	#dataSignal: GameListSignal;

	constructor({ httpClient }: GameStoreDeps) {
		super({ httpClient });
		this.#dataSignal = $state({ list: null, isLoading: false, hasLoaded: false });
	}

	loadGames = async () => {
		try {
			return await this.withHttpClient(async ({ client }) => {
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
			this.#dataSignal.hasLoaded = true;
		}
	};

	get gameList() {
		return this.#dataSignal.list;
	}

	get isLoading() {
		return this.#dataSignal.isLoading;
	}

	get hasLoaded() {
		return this.#dataSignal.hasLoaded;
	}
}
