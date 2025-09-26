import type { IServerHeartbeat } from '$lib/client/event-source-manager/serverHeartbeat.svelte';
import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
	getServerUtcNowResponseSchema,
	HttpClientNotSetError,
	JsonStrategy,
	type IFetchClient,
} from '@playnite-insights/lib/client';
import type { HttpClientSignal } from '../AppData.types';

export type ServerTimeStoreDeps = {
	httpClientSignal: HttpClientSignal;
	serverHeartbeat: IServerHeartbeat;
};

export type ServerTimeSignal = {
	utcNow: number | null;
	syncPoint: number | null;
	isLoading: boolean;
};

export class ServerTimeStore {
	#httpClientSignal: ServerTimeStoreDeps['httpClientSignal'];
	#serverHeartbeat: ServerTimeStoreDeps['serverHeartbeat'];
	#dataSignal: ServerTimeSignal;

	constructor({ httpClientSignal, serverHeartbeat }: ServerTimeStoreDeps) {
		this.#httpClientSignal = httpClientSignal;
		this.#serverHeartbeat = serverHeartbeat;
		this.#dataSignal = $state({ utcNow: null, syncPoint: null, isLoading: false });
	}

	#withHttpClient = <T>(cb: (props: { client: IFetchClient }) => Promise<T>): Promise<T> => {
		const client = this.#httpClientSignal.client;
		if (!client) throw new HttpClientNotSetError();
		return cb({ client });
	};

	loadServerTime = async () => {
		if (!this.#serverHeartbeat.isAlive) return null;
		try {
			return await this.#withHttpClient(async ({ client }) => {
				this.#dataSignal.isLoading = true;
				const result = await client.httpGetAsync({
					endpoint: '/api/time/now',
					strategy: new JsonStrategy(getServerUtcNowResponseSchema),
				});
				this.#dataSignal.utcNow = result ? new Date(result.utcNow).getTime() : null;
				this.#dataSignal.syncPoint = performance.now();
				return result;
			});
		} catch (err) {
			handleClientErrors(err, `[loadServerTime] failed to fetch /api/time/now`);
			return null;
		} finally {
			this.#dataSignal.isLoading = false;
		}
	};

	get utcNow() {
		return this.#dataSignal.utcNow;
	}

	get syncPoint() {
		return this.#dataSignal.syncPoint;
	}

	get isLoading() {
		return this.#dataSignal.isLoading;
	}
}
