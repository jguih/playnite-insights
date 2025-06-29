import { getPlayniteLibraryManifest } from '$lib/services/library-manifest';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const manifest = getPlayniteLibraryManifest();
	if (manifest) {
		return json(manifest);
	}
	return new Response(null, { status: 404 });
};
