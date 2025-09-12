import { m } from '$lib/paraglide/messages';
import { toast } from '../app-state/toast.svelte';
import { FetchClientStrategyError } from './error/fetchClientStrategyError';
import { HttpClientNotSetError } from './error/httpClientNotSetError';

export const handleFetchClientErrors = (error: unknown, message: string) => {
	console.error(error);
	if (error instanceof FetchClientStrategyError)
		toast.error({ title: message, message: error.message });
	else if (error instanceof HttpClientNotSetError) {
		toast.error({ title: message, message: error.message });
	} else {
		toast.error({ title: message, message: m.error_something_went_wrong() });
	}
};
