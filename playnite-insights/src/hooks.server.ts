import { paraglideMiddleware } from '$lib/paraglide/server';
import { makeServerServices, type ServerServices } from '$lib/server/setup-services';
import { defaultFileSystemService, getDb, initDatabase } from '@playnite-insights/infra';
import { type Handle, type ServerInit } from '@sveltejs/kit';
import { randomUUID } from 'crypto';

let _services: ServerServices;

export const init: ServerInit = async () => {
	if (_services) return;

	const db = getDb();
	_services = makeServerServices({ getDb });

	_services.logService.debug(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
	_services.logService.debug(`NODE_VERSION: ${process.env.NODE_VERSION || 'undefined'}`);
	_services.logService.info(`LOG_LEVEL: ${_services.logService.CURRENT_LOG_LEVEL}`);
	_services.logService.info(`TZ: ${process.env.TZ}`);
	_services.logService.info(
		`PLAYNITE_HOST_ADDRESS: ${_services.config.PLAYNITE_HOST_ADDRESS || 'undefined'}`,
	);

	await initDatabase({
		db,
		fileSystemService: defaultFileSystemService,
		MIGRATIONS_DIR: _services.config.MIGRATIONS_DIR,
		logService: _services.logService,
	});

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
