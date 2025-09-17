import { m } from '$lib/paraglide/messages';
import {
	AppError,
	FetchClientStrategyError,
	HttpClientNotSetError,
} from '@playnite-insights/lib/client';
import { toast } from '../app-state/toast.svelte';

export const handleClientErrors = (error: unknown, message: string) => {
	console.error(error);
	if (error instanceof HttpClientNotSetError) {
		toast.error({ title: message, message: m.error_http_client_not_set(), category: 'network' });
	} else if (error instanceof FetchClientStrategyError) {
		toast.error({ title: message, message: error.message, category: 'network' });
	} else if (error instanceof AppError) {
		toast.error({ title: message, message: error.message, category: 'app' });
	} else {
		toast.error({ title: message, message: m.error_something_went_wrong(), category: 'app' });
	}
};
