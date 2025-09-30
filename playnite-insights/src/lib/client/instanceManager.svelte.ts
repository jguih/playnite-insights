import {
	apiErrorSchema,
	EmptyStrategy,
	FetchClientStrategyError,
	HttpClientNotSetError,
	type IFetchClient,
} from '@playnite-insights/lib/client';
import type { KeyValueRepository } from './db/keyValueRepository.svelte';

export type InstanceManagerDeps = {
	keyValueRepository: KeyValueRepository;
	httpClient: IFetchClient | null;
};

export class InstanceManager {
	#keyValueRepository: InstanceManagerDeps['keyValueRepository'];
	#httpClient: InstanceManagerDeps['httpClient'];
	#isRegistered: boolean | null = null;

	constructor({ keyValueRepository, httpClient }: InstanceManagerDeps) {
		this.#keyValueRepository = keyValueRepository;
		this.#httpClient = httpClient;
	}

	#perfomHealthcheck = async (): Promise<boolean> => {
		if (!this.#httpClient) throw new HttpClientNotSetError();
		try {
			await this.#httpClient.httpGetAsync({
				endpoint: '/api/health',
				strategy: new EmptyStrategy(),
			});
			this.#isRegistered = true;
			return this.#isRegistered;
		} catch (error) {
			if (error instanceof FetchClientStrategyError && error.statusCode === 403) {
				if (error.data) {
					const apiError = apiErrorSchema.parse(error.data);
					switch (apiError.error.code) {
						case 'instance_not_registered':
							this.#isRegistered = false;
							break;
						case 'not_authorized':
						case 'invalid_request':
						default:
							this.#isRegistered = true;
							break;
					}
					return this.#isRegistered;
				}
			}
			throw error;
		} finally {
			if (this.#isRegistered !== null) {
				await this.#keyValueRepository.putAsync({
					keyvalue: { Key: 'instance-registered', Value: this.#isRegistered },
				});
			}
		}
	};

	isRegistered = async (): Promise<boolean> => {
		// Return from memory if possible
		if (this.#isRegistered !== null) return this.#isRegistered;
		// Init healthcheck
		const healthCheckPromise = this.#perfomHealthcheck();
		// Return from indexedDb if possible
		const isRegistered = await this.#keyValueRepository.getAsync({ key: 'instance-registered' });
		if (isRegistered !== null) {
			return (this.#isRegistered = isRegistered);
		}
		// Wait for healthcheck
		return await healthCheckPromise;
	};
}
