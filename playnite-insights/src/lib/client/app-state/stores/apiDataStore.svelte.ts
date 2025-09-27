import { HttpClientNotSetError, type IFetchClient } from '@playnite-insights/lib/client';

export type ApiDataStoreDeps = {
	httpClient: IFetchClient | null;
};

export class ApiDataStore {
	protected httpClient: ApiDataStoreDeps['httpClient'];

	constructor({ httpClient }: ApiDataStoreDeps) {
		this.httpClient = httpClient;
	}

	protected withHttpClient = <T>(
		cb: (props: { client: IFetchClient }) => Promise<T>,
	): Promise<T> => {
		const client = this.httpClient;
		if (!client) throw new HttpClientNotSetError();
		return cb({ client });
	};
}
