import { services } from '$lib';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	services.log.info('Received request to sync game library');
	const data = await request.json();
	const parseResult = services.playniteLibraryImporter.syncGameListCommandSchema.safeParse(data);
	if (parseResult.success) {
		const result = await services.playniteLibraryImporter.sync(parseResult.data);
		if (result) {
			return json(null, { status: 200 });
		}
	}
	return json(null, { status: 500 });
};
