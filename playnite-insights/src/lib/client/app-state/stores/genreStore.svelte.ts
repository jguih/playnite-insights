import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
	getAllGenresResponseSchema,
	HttpClientNotSetError,
	JsonStrategy,
	type GetAllGenresResponse,
	type IFetchClient,
} from '@playnite-insights/lib/client';
import type { HttpClientSignal } from '../AppData.types';

export type GenreStoreDeps = {
	httpClientSignal: HttpClientSignal;
};

export type GenreListSignal = {
	list: GetAllGenresResponse | null;
	isLoading: boolean;
};

export class GenreStore {
	#httpClientSignal: GenreStoreDeps['httpClientSignal'];
	#dataSignal: GenreListSignal;

	constructor({ httpClientSignal }: GenreStoreDeps) {
		this.#httpClientSignal = httpClientSignal;
		this.#dataSignal = $state({ list: null, isLoading: false });
	}

	#withHttpClient = <T>(cb: (props: { client: IFetchClient }) => Promise<T>): Promise<T> => {
		const client = this.#httpClientSignal.client;
		if (!client) throw new HttpClientNotSetError();
		return cb({ client });
	};

	loadGenres = async () => {
		try {
			return await this.#withHttpClient(async ({ client }) => {
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
