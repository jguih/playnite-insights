import { services } from '$lib';
import { ApiError, ValidationError } from '@playnite-insights/lib/client';
import { json } from '@sveltejs/kit';
import { ZodError } from 'zod/v4';

export const handleApiError = (err: unknown, context?: string): Response => {
	if (err instanceof ValidationError) {
		return json(
			{ error: { message: err.message, details: err.details } },
			{ status: err.statusCode },
		);
	}
	if (err instanceof ZodError) {
		return json(
			{
				error: { message: `Internal validation error at ${context ?? ''}`, details: err.issues },
			},
			{ status: 500 },
		);
	}
	if (err instanceof ApiError) {
		return json({ error: { message: err.message } }, { status: err.statusCode });
	}
	services.log.error('Internal server error', err);
	return json({ error: { message: 'Internal server error' } }, { status: 500 });
};
