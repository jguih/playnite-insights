import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { CURRENT_LOG_LEVEL, logInfo } from '$lib/services/log';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

logInfo(`ORIGIN: ${process.env.ORIGIN || 'undefined'}`);
logInfo(`LOG_LEVEL: ${CURRENT_LOG_LEVEL}`);
logInfo(`DATA_DIR: ${process.env.DATA_DIR || '/app/data'}`);

export const handle: Handle = async ({ event, resolve }) => {
	// Apply CORS header for API routes
	if (event.url.pathname.startsWith('/api')) {
		// Required for CORS to work
		if (event.request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': '*'
				}
			});
		}
	}

	const response = await handleParaglide({ event, resolve });
	if (event.url.pathname.startsWith('/api')) {
		response.headers.append('Access-Control-Allow-Origin', `*`);
	}
	return response;
};
