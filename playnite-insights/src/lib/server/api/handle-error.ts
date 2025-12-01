import { ApiError, type ApiErrorResponse } from '@playnite-insights/lib/client';
import { json } from '@sveltejs/kit';
import type { ServerServices } from '../setup-services';

const handleErrorCode = (code: string) => {
	switch (code) {
		case 'UND_ERR_CONNECT_TIMEOUT': {
			const response: ApiErrorResponse = {
				error: { code: 'internal_error', message: 'HTTP Request timeout' },
			};
			return json(response, { status: 500 });
		}
		default: {
			const response: ApiErrorResponse = {
				error: { code: 'internal_error', message: 'Internal server error' },
			};
			return json(response, { status: 500 });
		}
	}
};

export const handleApiError = (
	err: unknown,
	logService: ServerServices['logService'],
	context?: string,
): Response => {
	logService.error(`Error while handling API request at ${context ?? ''}`, err);
	if (err instanceof ApiError) {
		return json(err.response, { status: err.statusCode });
	}
	if (err instanceof Error) {
		if (err.cause && Object.hasOwn(err.cause, 'code')) {
			const code = (err.cause as Record<string, string>).code ?? '';
			return handleErrorCode(code);
		}
	}
	const response: ApiErrorResponse = {
		error: { code: 'internal_error', message: 'Internal server error' },
	};
	return json(response, { status: 500 });
};
