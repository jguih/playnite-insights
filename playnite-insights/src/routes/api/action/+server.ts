import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import { EmptyStrategy, FetchClientStrategyError } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		await services.playniteHostHttpClient.httpPostAsync({
			endpoint: '/',
			strategy: new EmptyStrategy(),
			body: {
				action: 'screenshot',
			},
		});
		return new Response(null, { status: 200 });
	} catch (error) {
		if (error instanceof FetchClientStrategyError) {
			return json({ error: { message: error.message } }, { status: error.statusCode });
		}
		return handleApiError(error, `POST /api/action`);
	}
};
