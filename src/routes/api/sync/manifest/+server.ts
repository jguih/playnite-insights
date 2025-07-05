import { services } from '$lib';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const manifest = await services.libraryManifest.get();
	if (manifest) {
		return json(manifest);
	}
	return new Response(null, { status: 404 });
};
