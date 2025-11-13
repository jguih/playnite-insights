import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
	FetchClientStrategyError,
	getAllCompaniesResponseSchema,
	JsonStrategy,
	type GetAllCompaniesResponse,
} from '@playnite-insights/lib/client';
import { ApiDataStore, type ApiDataStoreDeps } from './apiDataStore.svelte';

export type CompanyStoreDeps = ApiDataStoreDeps;

export type CompanyListSignal = {
	list: GetAllCompaniesResponse | null;
	isLoading: boolean;
};

export class CompanyStore extends ApiDataStore {
	#dataSignal: CompanyListSignal;

	constructor({ httpClient }: CompanyStoreDeps) {
		super({ httpClient });
		this.#dataSignal = $state({ list: null, isLoading: false });
	}

	loadCompanies = async () => {
		try {
			this.#dataSignal.isLoading = true;
			const result = await this.httpClient.httpGetAsync({
				endpoint: '/api/company',
				strategy: new JsonStrategy(getAllCompaniesResponseSchema),
			});
			this.#dataSignal.list = result;
			return result;
		} catch (err) {
			if (err instanceof FetchClientStrategyError && err.statusCode === 204) return null;
			handleClientErrors(err, `[loadCompanies] failed to fetch /api/company`);
			return null;
		} finally {
			this.#dataSignal.isLoading = false;
		}
	};

	get companyList() {
		return this.#dataSignal.list;
	}

	get isLoading() {
		return this.#dataSignal.isLoading;
	}
}
