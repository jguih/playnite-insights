import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
	getAllExtensionRegistrationsSchema,
	JsonStrategy,
	type GetAllExtensionRegistrationsResponse,
} from '@playnite-insights/lib/client';
import { ApiDataStore, type ApiDataStoreDeps } from './apiDataStore.svelte';

export type ExtensionRegistrationStoreDeps = ApiDataStoreDeps;

export type ExtensionRegistrationListSignal = {
	list: GetAllExtensionRegistrationsResponse['registrations'] | null;
	isLoading: boolean;
	hasLoaded: boolean;
};

export class ExtensionRegistrationStore extends ApiDataStore {
	#dataSignal: ExtensionRegistrationListSignal;

	constructor({ httpClient }: ExtensionRegistrationStoreDeps) {
		super({ httpClient });
		this.#dataSignal = $state({ list: null, isLoading: false, hasLoaded: false });
	}

	loadExtensionRegistrations = async () => {
		try {
			this.#dataSignal.isLoading = true;
			const result = await this.httpClient.httpGetAsync({
				endpoint: '/api/extension-registration',
				strategy: new JsonStrategy(getAllExtensionRegistrationsSchema),
			});
			this.#dataSignal.list = result.registrations;
		} catch (err) {
			handleClientErrors(
				err,
				`[loadExtensionRegistrations] failed to fetch /api/extension-registration`,
			);
		} finally {
			this.#dataSignal.isLoading = false;
			this.#dataSignal.hasLoaded = true;
		}
	};

	get listSignal() {
		return this.#dataSignal.list;
	}

	get isLoadingSignal() {
		return this.#dataSignal.isLoading;
	}

	get hasLoadedSignal() {
		return this.#dataSignal.hasLoaded;
	}
}
