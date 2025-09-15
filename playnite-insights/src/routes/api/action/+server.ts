import { services } from '$lib';
import { handleApiError } from '$lib/server/api/handle-error';
import {
  EmptyStrategy,
  FetchClientStrategyError,
  remoteActionSchema,
} from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const jsonBody = await request.json();
		const result = remoteActionSchema.safeParse(jsonBody);
		if (!result.success) {
			return json({ error: { message: 'Invalid command' } }, { status: 400 });
		}
		const command = result.data;
		await services.playniteHostHttpClient.httpPostAsync({
			endpoint: '/',
			strategy: new EmptyStrategy(),
			body: command,
		});
		return new Response(null, { status: 200 });
	} catch (error) {
		if (error instanceof FetchClientStrategyError) {
			return json({ error: { message: error.message } }, { status: error.statusCode });
		}
		return handleApiError(error, `POST /api/action`);
	}
};
