import { services } from '$lib';
import { withInstanceAuth } from '$lib/server/api/authentication';
import {
	EmptyStrategy,
	FetchClientStrategyError,
	remoteActionSchema,
} from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url }) =>
	withInstanceAuth(request, url, async () => {
		try {
			const jsonBody = await request.json();
			const result = remoteActionSchema.safeParse(jsonBody);
			if (!result.success) {
				return json({ error: { message: 'Invalid command' } }, { status: 400 });
			}
			const command = result.data;
			services.log.info(`Running remote action on Playnite host: '${command.action}'`);
			await services.playniteHostHttpClient.httpPostAsync({
				endpoint: '/',
				strategy: new EmptyStrategy(),
				body: command,
			});
			services.log.success(`Remote action completed`);
			return new Response(null, { status: 200 });
		} catch (error) {
			if (error instanceof FetchClientStrategyError) {
				return json({ error: { message: error.message } }, { status: error.statusCode });
			}
			services.log.warning(
				`Make sure your Playnite host allows traffic through the port configured in PlayAtlas Exporter.`,
			);
			services.log.warning(
				`It's worth checking if the host's IPv4/IPv6 address haven changed. To avoid this issue, make sure to reserve an address on your router.`,
			);
			throw error;
		}
	});
