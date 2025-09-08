import { services } from '$lib';
import { emptyResponse, getAllGamesResponseSchema } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
	const data = services.playniteGameRepository.all();

	if (!data || data.length === 0) {
		return emptyResponse();
	}

	const result = getAllGamesResponseSchema.safeParse(data);

	if (!result.success) {
		services.log.error(`Schema validation failed: ${result.error.format()}`);
		return json(
			{ error: { message: 'Invalid server data', details: result.error.flatten() } },
			{ status: 500 },
		);
	}

	return json(result.data);
};
