import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
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
			return await this.withHttpClient(async ({ client }) => {
				this.#dataSignal.isLoading = true;
				const result = await client.httpGetAsync({
					endpoint: '/api/company',
					strategy: new JsonStrategy(getAllCompaniesResponseSchema),
				});
				this.#dataSignal.list = result;
				return result;
			});
		} catch (err) {
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
