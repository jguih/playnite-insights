import { m } from '$lib/paraglide/messages';
import { AppError } from '@playnite-insights/lib/client';

export class HttpClientNotSetError extends AppError {
	constructor() {
		super(m.error_http_client_not_set());
	}
}
