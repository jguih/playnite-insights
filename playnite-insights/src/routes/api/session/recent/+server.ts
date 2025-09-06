import { services } from '$lib';
import { json, type RequestHandler } from '@sveltejs/kit';
import { createHash } from 'crypto';

export const GET: RequestHandler = async ({ request }) => {
	const ifNoneMatch = request.headers.get('if-none-match');
	const ifModifiedSince = request.headers.get('if-modified-since');

	try {
		const data = services.gameSession.getRecent();
		if (data && data.length > 0) {
			const firstSession = data[0];
			const lastModified = firstSession.EndTime ? firstSession.EndTime : firstSession.StartTime;
			const jsonStr = JSON.stringify(data);
			const hash = createHash('sha256').update(jsonStr).digest('hex');
			const etag = `"${hash}"`;
			if (ifNoneMatch === etag || ifModifiedSince === lastModified) {
				return new Response(null, { status: 304 });
			}
			return json(data, {
				headers: { 'Cache-Control': 'no-cache', 'Last-Modified': lastModified, ETag: etag },
			});
		}
		return new Response(null, { status: 404 });
	} catch (err) {
		return new Response(null, { status: 500 });
	}
};
