import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
	getAllGenresResponseSchema,
	JsonStrategy,
	type GetAllGenresResponse,
} from '@playnite-insights/lib/client';
import { ApiDataStore, type ApiDataStoreDeps } from './apiDataStore.svelte';

export type GenreStoreDeps = ApiDataStoreDeps;

export type GenreListSignal = {
	list: GetAllGenresResponse | null;
	isLoading: boolean;
};

export class GenreStore extends ApiDataStore {
	#dataSignal: GenreListSignal;

	constructor({ httpClient }: GenreStoreDeps) {
		super({ httpClient });
		this.#dataSignal = $state({ list: null, isLoading: false });
	}

	loadGenres = async () => {
		try {
			return await this.withHttpClient(async ({ client }) => {
				this.#dataSignal.isLoading = true;
				const result = await client.httpGetAsync({
					endpoint: '/api/genre',
					strategy: new JsonStrategy(getAllGenresResponseSchema),
				});
				this.#dataSignal.list = result;
				return result;
			});
		} catch (err) {
			handleClientErrors(err, `[loadGenres] failed to fetch /api/genre`);
			return null;
		} finally {
			this.#dataSignal.isLoading = false;
		}
	};

	get genreList() {
		return this.#dataSignal.list;
	}

	get isLoading() {
		return this.#dataSignal.isLoading;
	}
}
