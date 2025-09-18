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

const ASSETS = [
	...build, // the app itself
	...files, // everything in `static`
];

sw.addEventListener('install', (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CacheKeys.APP);
		await cache.addAll(ASSETS);
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
			if (!cachedResponse || (cachedETag && networkETag && cachedETag !== networkETag)) {
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

		return new Response('Network error and no cache available', { status: 503 });
	}
}

sw.addEventListener('fetch', async (event) => {
	if (event.request.method !== 'GET') return;
	if (event.request.headers.get('Accept')?.includes('text/event-stream')) return;

	const url = new URL(event.request.url);

	if (ASSETS.includes(url.pathname) || !url.pathname.startsWith('/api')) {
		const returnCachedAssets = async () => {
			const cache = await caches.open(CacheKeys.APP);
			const cachedResponse = await cache.match(url.pathname);
			if (cachedResponse) return cachedResponse;
			const response = await fetch(event.request);
			if (shouldCache(response)) {
				cache.put(url.pathname, response.clone());
			}
			return response;
		};
		event.respondWith(returnCachedAssets());
		return;
	}

	for (const [prefix, cacheKey, updateMessage, strategy] of apiRoutes) {
		if (url.pathname.startsWith(prefix)) {
			event.respondWith(strategy(event.request, cacheKey, updateMessage));
			return;
		}
	}

	return;
});
