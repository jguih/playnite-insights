import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
	getRecentSessionsResponseSchema,
	JsonStrategy,
	type GetRecentSessionsResponse,
} from '@playnite-insights/lib/client';
import { ApiDataStore, type ApiDataStoreDeps } from './apiDataStore.svelte';

export type GameSessionStoreDeps = ApiDataStoreDeps;

export type RecentSessionsSignal = {
	list: GetRecentSessionsResponse | null;
	isLoading: boolean;
};

export class GameSessionStore extends ApiDataStore {
	#recentSessionsSignal: RecentSessionsSignal;

	constructor({ httpClient }: GameSessionStoreDeps) {
		super({ httpClient });
		this.#recentSessionsSignal = $state({ list: null, isLoading: false });
	}

	loadRecentSessions = async () => {
		try {
			return await this.withHttpClient(async ({ client }) => {
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
