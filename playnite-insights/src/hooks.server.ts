import { paraglideMiddleware } from '$lib/paraglide/server';
import { setupServices } from '$lib/server/setup-services';
import { defaultFileSystemService, initDatabase } from '@playnite-insights/infra';
import type { Handle, ServerInit } from '@sveltejs/kit';

export const { services } = setupServices();

export const init: ServerInit = async () => {
	services.log.debug(`Server init function called`);
	services.log.debug(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
	services.log.debug(`NODE_VERSION: ${process.env.NODE_VERSION || 'undefined'}`);
	services.log.info(`ORIGIN: ${process.env.ORIGIN || 'undefined'}`);
	services.log.info(`APP_NAME: ${process.env.APP_NAME}`);
	services.log.info(`LOG_LEVEL: ${services.log.CURRENT_LOG_LEVEL}`);
	services.log.info(`TZ: ${process.env.TZ}`);
	services.log.info(`PLAYNITE_HOST_ADDRESS: ${process.env.PLAYNITE_HOST_ADDRESS} || 'undefined'`);
	await initDatabase({
		fileSystemService: defaultFileSystemService,
		DB_FILE: services.config.DB_FILE,
		MIGRATIONS_DIR: services.config.MIGRATIONS_DIR,
		logService: services.log,
	});
	await services.libraryManifest.write();
	await services.signature.generateKeyPairAsync();
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale),
		});
	});

export const handle: Handle = async ({ event, resolve }) => {
	// Apply CORS header for API routes
	if (event.url.pathname.startsWith('/api')) {
		// Required for CORS to work
		if (event.request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': '*',
				},
			});
		}
	}

	const response = await handleParaglide({ event, resolve });

	if (event.url.pathname.startsWith('/api')) {
		response.headers.append('Access-Control-Allow-Origin', `*`);
	}

	return response;
};
