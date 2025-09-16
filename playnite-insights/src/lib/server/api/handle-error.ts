import { services } from '$lib';
import { ApiError, ValidationError } from '@playnite-insights/lib/client';
import { json } from '@sveltejs/kit';

const handleErrorCode = (code: string) => {
	switch (code) {
		case 'UND_ERR_CONNECT_TIMEOUT': {
			return json({ error: { message: 'HTTP Request timeout' } }, { status: 500 });
		}
		default: {
			return json({ error: { message: 'Internal server error' } }, { status: 500 });
		}
	}
};

export const handleApiError = (err: unknown, context?: string): Response => {
	services.log.error(`Error while handling API request at ${context ?? ''}`, err);
	if (err instanceof ValidationError) {
		return json(
			{ error: { message: err.message, details: err.details } },
			{ status: err.statusCode },
		);
	}
	if (err instanceof ApiError) {
		return json({ error: { message: err.message } }, { status: err.statusCode });
	}
	if (err instanceof Error) {
		if (err.cause && Object.hasOwn(err.cause, 'code')) {
			const code = (err.cause as Record<string, string>).code ?? '';
			return handleErrorCode(code);
		}
	}
	return json({ error: { message: 'Internal server error' } }, { status: 500 });
};
