import { HttpClientNotSetError, type IFetchClient } from '@playnite-insights/lib/client';
import type { HttpClientSignal, IndexedDbSignal } from './AppData.types';
import { ClientServiceLocator } from './serviceLocator';

export const httpClientSignal = $state<HttpClientSignal>({ client: null });
export const indexedDbSignal = $state<IndexedDbSignal>({ db: null, dbReady: null });
export const locator = new ClientServiceLocator({
	httpClientSignal,
	indexedDbSignal,
});

export async function withHttpClient<T>(
	cb: (props: { client: IFetchClient }) => Promise<T>,
): Promise<T> {
	const client = httpClientSignal.client;
	if (!client) throw new HttpClientNotSetError();
	return cb({ client });
}
