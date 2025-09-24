import { services } from '$lib';
import { withExtensionAuth } from '$lib/server/api/authentication';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url }) =>
	withExtensionAuth(request, url, 'none', async () => {
		services.log.info('Received request to sync library files');
		await services.playniteLibraryImporter.importMediaFiles(request, url);
		return json({ status: 'OK' });
	});
