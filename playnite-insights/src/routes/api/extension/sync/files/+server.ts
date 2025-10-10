import { withExtensionAuth } from '$lib/server/api/authentication';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url, locals: { services } }) =>
	withExtensionAuth(request, url, services, 'none', async () => {
		services.logService.info('Received request to sync library files');
		await services.playniteLibraryImporterService.importMediaFiles(request, url);
		return json({ status: 'OK' });
	});
