import { type IFetchClient } from '@playnite-insights/lib/client';

export type ApiDataStoreDeps = {
	httpClient: IFetchClient;
};

export class ApiDataStore {
	protected httpClient: ApiDataStoreDeps['httpClient'];

	constructor({ httpClient }: ApiDataStoreDeps) {
		this.httpClient = httpClient;
	}
}
