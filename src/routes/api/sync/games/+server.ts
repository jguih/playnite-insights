import { services } from '$lib';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	services.log.logInfo('Received request to sync game library');
	const data = await request.json();
	const parseResult = services.playniteLibraryImport.syncGameListCommandSchema.safeParse(data);
	if (parseResult.success) {
		const result = await services.playniteLibraryImport.sync(parseResult.data);
		if (result) {
			return json(null, { status: 200 });
		}
	}
	return json(null, { status: 500 });
};
