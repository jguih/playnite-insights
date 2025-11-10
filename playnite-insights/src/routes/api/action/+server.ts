import { withInstanceAuth } from '$lib/server/api/authentication';
import { remoteActionSchema } from '@playatlas/playnite-integration/core';
import { EmptyStrategy, FetchClientStrategyError } from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url, locals: { services } }) =>
	withInstanceAuth(request, url, services, async () => {
		try {
			const jsonBody = await request.json();
			const result = remoteActionSchema.safeParse(jsonBody);
			if (!result.success) {
				return json({ error: { message: 'Invalid command' } }, { status: 400 });
			}
			const command = result.data;
			services.logService.info(`Running remote action on Playnite host: '${command.action}'`);
			await services.playniteHostHttpClient.httpPostAsync({
				endpoint: '/',
				strategy: new EmptyStrategy(),
				body: command,
			});
			services.logService.success(`Remote action completed`);
			return new Response(null, { status: 200 });
		} catch (error) {
			if (error instanceof FetchClientStrategyError) {
				return json({ error: { message: error.message } }, { status: error.statusCode });
			}
			services.logService.warning(
				`Make sure your Playnite host allows traffic through the port configured in PlayAtlas Exporter.`,
			);
			services.logService.warning(
				`It's worth checking if the host's IPv4/IPv6 address have changed. To avoid this issue, make sure to reserve an address on your router.`,
			);
			throw error;
		}
	});
