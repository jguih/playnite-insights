import { services } from '$lib';
import { emptyResponse, getAllPlatformsResponseSchema } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
	const _data = services.platformRepository.all();

	if (!_data || _data.length === 0) {
		return emptyResponse();
	}

	const result = getAllPlatformsResponseSchema.safeParse(_data);

	if (!result.success) {
		services.log.error(`Schema validation failed: ${result.error.format()}`);
		return json(
			{ error: { message: 'Invalid server data', details: result.error.flatten() } },
			{ status: 500 },
		);
	}

	return json(result.data);
};
