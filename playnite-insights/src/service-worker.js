/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

/**
 * @param {string} name
 */
const cacheKey = (name) => `${name}-data-${version}`;

const CacheKeys = {
	APP: cacheKey('app'),
	GAMES: cacheKey('games'),
	COMPANY: cacheKey('company'),
	GENRE: cacheKey('genre'),
	PLATFORM: cacheKey('platform'),
	RECENT_SESSION: cacheKey('recent-session'),
	LIBRARY_METRICS: cacheKey('library-metrics'),
	SCREENSHOT_METADATA: cacheKey('screenshot_metadata'),
};

const cacheKeysArr = Object.values(CacheKeys);

/**
 * @typedef {{
 *  type: string
 * }} UpdateMessage
 */

/**
 * @typedef {[
 *   string,                // prefix (e.g. "/api/game")
 *   string,                // cache key
 *   UpdateMessage,      // update message
 *   (request: Request, cacheName: string, updateMessage?: UpdateMessage) => Promise<Response> // strategy fn
 * ]} ApiRoute
 */

/**
 *  @type {ApiRoute[]}
 */
const apiRoutes = [
	['/api/game', CacheKeys.GAMES, { type: 'GAMES_UPDATE' }, staleWhileRevalidate],
	['/api/company', CacheKeys.COMPANY, { type: 'COMPANY_UPDATE' }, staleWhileRevalidate],
	['/api/genre', CacheKeys.GENRE, { type: 'GENRE_UPDATE' }, staleWhileRevalidate],
	['/api/platform', CacheKeys.PLATFORM, { type: 'PLATFORM_UPDATE' }, staleWhileRevalidate],
	[
		'/api/session/recent',
		CacheKeys.RECENT_SESSION,
		{ type: 'RECENT_SESSION_UPDATE' },
		networkFirst,
	],
	[
		'/api/library/metrics',
		CacheKeys.LIBRARY_METRICS,
		{ type: 'LIBRARY_METRICS_UPDATE' },
		staleWhileRevalidate,
	],
	[
		'/api/assets/image/screenshot/all',
		CacheKeys.SCREENSHOT_METADATA,
		{ type: 'ALL_SCREENSHOT_UPDATE' },
		staleWhileRevalidate,
	],
];

/**
 * @type {string[]}
 */
const shellRoutes = ['/', '/game', '/game/journal', '/dash', '/settings'];

const ASSETS = [
	...build, // the app itself
	...files, // everything in `static`
];

sw.addEventListener('install', (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CacheKeys.APP);
		await cache.addAll(ASSETS);
		for (const shellRoute of shellRoutes) {
			try {
				const response = await fetch(shellRoute);
				if (!(response instanceof Response)) {
					throw new Error('Invalid response from fetch');
				}
				if (shouldCache(response)) {
					await cache.put(shellRoute, response.clone());
				}
			} catch (error) {
				console.error(`Failed to pre-cache shell route ${shellRoute}`, error);
			}
		}
	}

	event.waitUntil(addFilesToCache());
});

sw.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (!cacheKeysArr.includes(key)) await caches.delete(key);
		}
	}

	event.waitUntil(Promise.all([deleteOldCaches(), sw.clients.claim()]));
});

sw.addEventListener('message', (event) => {
	if (!event.data) return;

	switch (event.data.action) {
		case 'skipWaiting': {
			sw.skipWaiting();
			break;
		}
	}
});

/**
 *
 * @param {UpdateMessage} message
 */
function notifyClients(message) {
	sw.clients.matchAll().then((clients) => {
		clients.forEach((client) => {
			client.postMessage(message);
		});
	});
}

/**
 *
 * @param {Response} response
 */
function shouldCache(response) {
	return response.type !== 'opaque' && response.ok;
}

/**
 *
 * @param {Request} request
 * @param {string} cacheName
 * @param {UpdateMessage} updateMessage
 */
async function staleWhileRevalidate(request, cacheName, updateMessage = { type: 'UNKNOWN' }) {
	const cache = await caches.open(cacheName);
	const cachedResponse = await cache.match(request);
	const cachedETag = cachedResponse?.headers.get('ETag');

	const fetchAndUpdate = fetch(request)
		.then((networkResponse) => {
			if (shouldCache(networkResponse)) {
				cache.put(request, networkResponse.clone());
			}
			const networkETag = networkResponse.headers.get('ETag');
			if (networkResponse.ok && cachedETag && networkETag && cachedETag !== networkETag) {
				notifyClients(updateMessage);
			}
			return networkResponse;
		})
		.catch(() => {
			return (
				cachedResponse || new Response(null, { status: 503, statusText: 'Service Unavailable' })
			);
		});

	return cachedResponse || fetchAndUpdate;
}

/**
 * @param {Request} request
 * @param {string} cacheName
 */

async function networkFirst(request, cacheName) {
	const cache = await caches.open(cacheName);

	try {
		const networkResponse = await fetch(request);
		if (!(networkResponse instanceof Response)) {
			throw new Error('Invalid response from fetch');
		}
		if (shouldCache(networkResponse)) {
			cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch {
		// Network failed, try to return from cache
		const cachedResponse = await cache.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}

		return new Response('Service Unavailable', { status: 503 });
	}
}

/**
 *
 * @param {string} pathname
 * @param {string} cacheName
 * @param {Request} request
 */
async function shellRouteStrategy(pathname, cacheName, request) {
	const cache = await caches.open(cacheName);
	try {
		const networkResponse = await fetch(request);
		if (!(networkResponse instanceof Response)) {
			throw new Error('Invalid response from fetch');
		}
		if (shouldCache(networkResponse)) {
			cache.put(pathname, networkResponse.clone());
		}
		return networkResponse;
	} catch {
		const cachedResponse = await cache.match(pathname);
		if (cachedResponse) {
			return cachedResponse;
		}
		return new Response('Service Unavailable', { status: 503 });
	}
}

sw.addEventListener('fetch', async (event) => {
	if (event.request.method !== 'GET') return;
	if (event.request.headers.get('Accept')?.includes('text/event-stream')) return;

	const url = new URL(event.request.url);

	// Always return cached assets
	if (ASSETS.includes(url.pathname)) {
		const serveCachedAssets = async () => {
			const cache = await caches.open(CacheKeys.APP);
			const response = await cache.match(url.pathname);
			if (response) return response;
			return fetch(event.request);
		};
		event.respondWith(serveCachedAssets());
		return;
	}

	if (shellRoutes.includes(url.pathname)) {
		event.respondWith(shellRouteStrategy(url.pathname, CacheKeys.APP, event.request));
		return;
	}

	// Network first for everything that is not from api
	if (!url.pathname.startsWith('/api')) {
		event.respondWith(networkFirst(event.request, CacheKeys.APP));
		return;
	}

	// Handle api caching
	for (const [prefix, cacheKey, updateMessage, strategy] of apiRoutes) {
		if (url.pathname.startsWith(prefix)) {
			event.respondWith(strategy(event.request, cacheKey, updateMessage));
			return;
		}
	}

	return;
});
