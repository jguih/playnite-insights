import { getGameImage } from '$lib/services/playnite-game/game-images';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, request }) => {
	const { playniteGameId, playniteImageFileName } = params;
	const ifNoneMatch = request.headers.get('if-none-match');
	const ifModifiedSince = request.headers.get('if-modified-since');
	if (!playniteGameId || !playniteImageFileName) {
		return json({ error: 'Missing playniteGameId or playniteImageId' }, { status: 400 });
	}
	const result = await getGameImage(
		playniteGameId,
		playniteImageFileName,
		ifNoneMatch,
		ifModifiedSince
	);
	if (!result.isValid || !result.data) {
		return json({ error: result.message }, { status: result.httpCode });
	}
	return result.data; // Assuming result.data is a Response object
};
