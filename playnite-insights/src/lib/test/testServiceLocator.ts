import { ClientServiceLocator } from '$lib/client/app-state/serviceLocator.svelte';
import type { makeMocks } from '@playnite-insights/testing';

export class TestServiceLocator extends ClientServiceLocator {
	constructor(mocks: ReturnType<typeof makeMocks>) {
		super();
		this._httpClient = mocks.fetchClient;

		// To start indexeddb
		void this.dbSignal;
	}
}
