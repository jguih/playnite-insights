import { paraglideMiddleware } from '$lib/paraglide/server';
import { setupServices } from '$lib/server/setup-services';
import { config, defaultFileSystemService, initDatabase } from '@playnite-insights/infra';
import { PLAYNITE_GAMES_JSON_FILE } from '@playnite-insights/infra/config/config';
import type { Handle, ServerInit } from '@sveltejs/kit';
import { randomUUID } from 'crypto';

export const { services } = setupServices();

export const init: ServerInit = async () => {
	services.log.debug(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
	services.log.debug(`NODE_VERSION: ${process.env.NODE_VERSION || 'undefined'}`);
	services.log.info(`APP_NAME: ${process.env.PLAYATLAS_INSTANCE_NAME}`);
	services.log.info(`LOG_LEVEL: ${services.log.CURRENT_LOG_LEVEL}`);
	services.log.info(`TZ: ${process.env.TZ}`);
	services.log.info(`PLAYNITE_HOST_ADDRESS: ${config.PLAYNITE_HOST_ADDRESS || 'undefined'}`);

	await initDatabase({
		fileSystemService: defaultFileSystemService,
		DB_FILE: services.config.DB_FILE,
		MIGRATIONS_DIR: services.config.MIGRATIONS_DIR,
		logService: services.log,
	});

	await services.libraryManifest.write();

	try {
		await services.signature.generateKeyPairAsync();
	} catch (error) {
		services.log.error(`Failed to create asymmetric key pair`, error);
	}

	try {
		services.fileSystem.rm(PLAYNITE_GAMES_JSON_FILE, { force: true });
	} catch (error) {
		services.log.error(
			`Failed to delete deprecated games JSON file at ${PLAYNITE_GAMES_JSON_FILE}`,
			error,
		);
	}

	const now = new Date();
	try {
		const syncId = services.synchronizationIdRepository.get();
		if (!syncId) {
			const syncId = randomUUID();
			services.synchronizationIdRepository.set({
				Id: 1,
				SyncId: randomUUID(),
				CreatedAt: now.toISOString(),
				LastUsedAt: now.toISOString(),
			});
			services.log.info(`Created synchronization id: ${syncId}`);
		}
	} catch (error) {
		services.log.error(`Failed to create synchronization id`, error);
	}
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
