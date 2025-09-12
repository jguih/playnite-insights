import { m } from '$lib/paraglide/messages';

export class HttpClientNotSetError extends Error {
	constructor() {
		super(m.error_http_client_not_set());
	}
}
