import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
	getRecentSessionsResponseSchema,
	HttpClientNotSetError,
	JsonStrategy,
	type GetRecentSessionsResponse,
	type IFetchClient,
} from '@playnite-insights/lib/client';
import type { HttpClientSignal } from '../AppData.types';

export type GameSessionStoreDeps = {
	httpClientSignal: HttpClientSignal;
};

export type RecentSessionsSignal = {
	list: GetRecentSessionsResponse | null;
	isLoading: boolean;
};

export class GameSessionStore {
	#httpClientSignal: GameSessionStoreDeps['httpClientSignal'];
	#recentSessionsSignal: RecentSessionsSignal;

	constructor({ httpClientSignal }: GameSessionStoreDeps) {
		this.#httpClientSignal = httpClientSignal;
		this.#recentSessionsSignal = $state({ list: null, isLoading: false });
	}

	#withHttpClient = <T>(cb: (props: { client: IFetchClient }) => Promise<T>): Promise<T> => {
		const client = this.#httpClientSignal.client;
		if (!client) throw new HttpClientNotSetError();
		return cb({ client });
	};

	loadRecentSessions = async () => {
		try {
			return await this.#withHttpClient(async ({ client }) => {
				this.#recentSessionsSignal.isLoading = true;
				const result = await client.httpGetAsync({
					endpoint: '/api/session/recent',
					strategy: new JsonStrategy(getRecentSessionsResponseSchema),
				});
				this.#recentSessionsSignal.list = result;
				return result;
			});
		} catch (err) {
			handleClientErrors(err, `[loadRecentGameSessions] failed to fetch /api/session/recent`);
			return null;
		} finally {
			this.#recentSessionsSignal.isLoading = false;
		}
	};

	get recentSessions() {
		return this.#recentSessionsSignal.list;
	}

	get isLoading() {
		return this.#recentSessionsSignal.isLoading;
	}
}
