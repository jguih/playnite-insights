import { getPlayniteLibraryManifest } from '$lib/library-manifest/library-manifest';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const manifest = await getPlayniteLibraryManifest();
	if (manifest) {
		return json(manifest);
	}
	return new Response(null, { status: 404 });
};
