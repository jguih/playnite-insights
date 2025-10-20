import {
	apiErrorSchema,
	AppClientError,
	EmptyStrategy,
	FetchClientStrategyError,
	type IFetchClient,
} from '@playnite-insights/lib/client';
import { IndexedDBNotInitializedError } from './db/errors/indexeddbNotInitialized';
import type { KeyValueRepository } from './db/keyValueRepository.svelte';
import type { ILogService } from './logService.svelte';

export type InstanceManagerDeps = {
	keyValueRepository: KeyValueRepository;
	httpClient: IFetchClient;
	logService: ILogService;
};

export class InstanceManager {
	#keyValueRepository: InstanceManagerDeps['keyValueRepository'];
	#httpClient: InstanceManagerDeps['httpClient'];
	#logService: InstanceManagerDeps['logService'];
	#isRegistered: boolean | null = null;

	constructor({ keyValueRepository, httpClient, logService }: InstanceManagerDeps) {
		this.#keyValueRepository = keyValueRepository;
		this.#httpClient = httpClient;
		this.#logService = logService;
	}

	#performHealthcheck = async (): Promise<boolean> => {
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
		try {
			// Init healthcheck
			const healthCheckPromise = this.#performHealthcheck();
			// Return from indexedDb if possible
			const isRegistered = await this.#keyValueRepository.getAsync({ key: 'instance-registered' });
			if (isRegistered !== null) {
				return (this.#isRegistered = isRegistered);
			}
			// Wait for healthcheck
			return await healthCheckPromise;
		} catch (error) {
			if (error instanceof IndexedDBNotInitializedError) {
				this.#logService.error(
					`IndexedDb not initialized while checking instance registration: ${error.message}`,
				);
				throw new AppClientError(
					{
						code: 'indexeddb_not_initialized',
						message: 'IndexedDb not initialized while checking instance registration',
					},
					error,
				);
			} else if (error instanceof DOMException) {
				this.#logService.error(
					`DOMException (${error.name}) while checking instance registration: ${error.message}`,
				);
				throw new AppClientError(
					{
						code: 'dom_exception',
						message: `DOMException (${error.name}) while checking instance registration`,
					},
					error,
				);
			} else if (error instanceof FetchClientStrategyError) {
				if (error.statusCode >= 500) {
					this.#logService.error(
						`HTTP request error while checking instance registration: ${error.message}`,
						error,
					);
					throw new AppClientError(
						{
							code: 'server_error',
							message: `HTTP request error while checking instance registration`,
						},
						error,
					);
				} else {
					this.#logService.debug(`HTTP request error while checking instance registration`);
					throw new AppClientError(
						{
							code: 'instance_registration_check_failed',
							message: `HTTP request error while checking instance registration`,
						},
						error,
					);
				}
			}
			this.#logService.error(`Unknown error while checking instance registration`, error);
			throw new AppClientError(
				{
					code: 'instance_registration_check_failed',
					message: `Unknown error while checking instance registration`,
				},
				error,
			);
		}
	};
}
