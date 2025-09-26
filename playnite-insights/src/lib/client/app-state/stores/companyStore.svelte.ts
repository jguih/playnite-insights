import { handleClientErrors } from '$lib/client/utils/handleClientErrors.svelte';
import {
	getAllCompaniesResponseSchema,
	HttpClientNotSetError,
	JsonStrategy,
	type GetAllCompaniesResponse,
	type IFetchClient,
} from '@playnite-insights/lib/client';
import type { HttpClientSignal } from '../AppData.types';

export type CompanyStoreDeps = {
	httpClientSignal: HttpClientSignal;
};

export type CompanyListSignal = {
	list: GetAllCompaniesResponse | null;
	isLoading: boolean;
};

export class CompanyStore {
	#httpClientSignal: CompanyStoreDeps['httpClientSignal'];
	#dataSignal: CompanyListSignal;

	constructor({ httpClientSignal }: CompanyStoreDeps) {
		this.#httpClientSignal = httpClientSignal;
		this.#dataSignal = $state({ list: null, isLoading: false });
	}

	#withHttpClient = <T>(cb: (props: { client: IFetchClient }) => Promise<T>): Promise<T> => {
		const client = this.#httpClientSignal.client;
		if (!client) throw new HttpClientNotSetError();
		return cb({ client });
	};

	loadCompanies = async () => {
		try {
			return await this.#withHttpClient(async ({ client }) => {
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
