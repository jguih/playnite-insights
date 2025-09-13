import { m } from '$lib/paraglide/messages';
import { AppError } from '@playnite-insights/lib/client';
import { toast } from '../app-state/toast.svelte';

export const handleClientErrors = (error: unknown, message: string) => {
	console.error(error);
	if (error instanceof AppError) {
		toast.error({ title: message, message: error.message });
	} else {
		toast.error({ title: message, message: m.error_something_went_wrong() });
	}
};
