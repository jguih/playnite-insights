import { extensionAuthMiddleware } from '$lib/server/api/middleware/auth.middleware';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url, locals: { services, api } }) =>
	extensionAuthMiddleware({ request, api }, async () => {
		services.logService.info('Received request to sync library files');
		await services.playniteLibraryImporterService.importMediaFiles(request, url);
		return json({ status: 'OK' });
	});
