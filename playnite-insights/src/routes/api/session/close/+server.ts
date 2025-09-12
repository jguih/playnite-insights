import { services } from '$lib';
import { closeGameSessionSchema } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const jsonBody = await request.json();
	const command = closeGameSessionSchema.safeParse(jsonBody);
	if (!command.success) {
		return json({ errors: command.error.format() }, { status: 400 });
	}
	const result = services.gameSession.close(command.data);
	if (result) {
		return new Response(undefined, { status: 200 });
	}
	return new Response(undefined, { status: 500 });
};
