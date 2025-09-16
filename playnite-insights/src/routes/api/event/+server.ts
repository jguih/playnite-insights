import { defaultSSEManager } from '@playnite-insights/infra';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const stream = defaultSSEManager.createStream();
	return stream.response;
};
