import { services } from '$lib';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, request }) => {
	const { playniteGameId, playniteImageFileName } = params;
	const ifNoneMatch = request.headers.get('if-none-match');
	const ifModifiedSince = request.headers.get('if-modified-since');
	if (!playniteGameId || !playniteImageFileName) {
		return json({ error: 'Missing playniteGameId or playniteImageId' }, { status: 400 });
	}
	const result = await services.mediaFiles.getGameImage(
		playniteGameId,
		playniteImageFileName,
		ifNoneMatch,
		ifModifiedSince,
	);
	return result;
};
