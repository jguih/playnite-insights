import { PLAYATLAS_DATA_DIR, PLAYATLAS_PLAYNITE_HOST_ADDRESS } from '$env/static/private';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { makeServerServices, type ServerServices } from '$lib/server/setup-services';
import { getDb, initDatabase } from '@playnite-insights/infra';
import { type Handle, type ServerInit } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

let _services: ServerServices;

export const init: ServerInit = async () => {
	if (_services) return;

	const __dirname = dirname(fileURLToPath(import.meta.url));
	const MIGRATIONS_DIR =
		process.env.NODE_ENV === 'production'
			? '/app/infra/migrations'
			: join(__dirname, '../../packages/@playnite-insights/infra/migrations');

	const env = {
		DATA_DIR: PLAYATLAS_DATA_DIR,
		PLAYNITE_HOST_ADDRESS: PLAYATLAS_PLAYNITE_HOST_ADDRESS,
		DB_FILE: join(PLAYATLAS_DATA_DIR, '/db'),
		MIGRATIONS_DIR,
		TMP_DIR: join(PLAYATLAS_DATA_DIR, '/tmp'),
	};

	const db = getDb({ path: env.DB_FILE });
	_services = makeServerServices({ getDb: () => db, env });

	_services.logService.debug(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
	_services.logService.debug(`NODE_VERSION: ${process.env.NODE_VERSION || 'undefined'}`);
	_services.logService.info(`LOG_LEVEL: ${_services.logService.CURRENT_LOG_LEVEL}`);
	_services.logService.info(`TZ: ${process.env.TZ}`);
	_services.logService.info(
		`PLAYNITE_HOST_ADDRESS: ${_services.config.PLAYNITE_HOST_ADDRESS || 'undefined'}`,
	);

	await initDatabase({ db, ..._services, ...env });

	await _services.libraryManifestService.write();

	try {
		await _services.signatureService.generateKeyPairAsync();
	} catch (error) {
		_services.logService.error(`Failed to create asymmetric key pair`, error);
	}

	const now = new Date();
	try {
		const syncId = _services.synchronizationIdRepository.get();
		if (!syncId) {
			const syncId = randomUUID();
			_services.synchronizationIdRepository.set({
				Id: 1,
				SyncId: randomUUID(),
				CreatedAt: now.toISOString(),
				LastUsedAt: now.toISOString(),
			});
			_services.logService.info(`Created synchronization id: ${syncId}`);
		}
	} catch (error) {
		_services.logService.error(`Failed to create synchronization id`, error);
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
	event.locals.services = _services;

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
