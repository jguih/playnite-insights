/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
	GAME_IMAGES: cacheKey('game-images'),
};

const cacheKeysArr = Object.values(CacheKeys);

/**
 * @var {[string, string, { type?: string }?]} apiRoutes
 */
const apiRoutes = [
	['/api/game', CacheKeys.GAMES, { type: 'GAMES_UPDATE' }],
	['/api/company', CacheKeys.COMPANY, { type: 'COMPANY_UPDATE' }],
	['/api/genre', CacheKeys.GENRE, { type: 'GENRE_UPDATE' }],
	['/api/platform', CacheKeys.PLATFORM, { type: 'PLATFORM_UPDATE' }],
	['/api/session/recent', CacheKeys.RECENT_SESSION, { type: 'RECENT_SESSION_UPDATE' }],
	['/api/library/metrics', CacheKeys.LIBRARY_METRICS, { type: 'LIBRARY_METRICS_UPDATE' }],
	['/api/assets/image', CacheKeys.GAME_IMAGES, { type: 'GAME_IMAGES_UPDATE' }],
];

/**
 * @var {string[]} ignoredApiRoutes
 */
const ignoredApiRoutes = ['/api/event', '/api/manifest', '/api/health'];

const ASSETS = [
	...build, // the app itself
	...files, // everything in `static`
];

self.addEventListener('install', (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CacheKeys.APP);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (!cacheKeysArr.includes(key)) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

/**
 *
 * @param {object} message
 */
function notifyClients(message) {
	clients.matchAll().then((clients) => {
		clients.forEach((client) => {
			client.postMessage(message);
		});
	});
}

/**
 *
 * @param {Request} request
 * @param {string} cacheName
 * @param {object} updateMessage
 */
async function staleWhileRevalidate(request, cacheName, updateMessage = { type: 'UNKNOWN' }) {
	const cache = await caches.open(cacheName);
	const cachedResponse = await cache.match(request);
	const cachedETag = cachedResponse?.headers.get('ETag');

	const fetchAndUpdate = fetch(request)
		.then((networkResponse) => {
			if (networkResponse.ok) {
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
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function networkFirst(request, cacheName) {
	const cache = await caches.open(cacheName);

	try {
		const networkResponse = await fetch(request);
		if (networkResponse.ok) {
			cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch {
		// Network failed, try to return from cache
		const cachedResponse = await cache.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}

		console.warn(`SW failed to fetch and found no cache for ${request.url}`, err);
		return new Response('Network error and no cache available', { status: 503 });
	}
}

/**
 * @param {Request} request
 * @param {string} cacheName
 */
async function defaultFetchHandler(request, cacheName) {
	const url = new URL(request.url);
	const cache = await caches.open(cacheName);

	if (ASSETS.includes(url.pathname)) {
		const response = await cache.match(url.pathname);
		if (response) return response;
	}

	try {
		const response = await fetch(request);
		if (response.ok) {
			cache.put(request, response.clone());
		}
		return response;
	} catch (err) {
		const fallback = await cache.match(request);
		if (fallback) return fallback;

		console.warn(`SW failed to fetch and found no cache for ${event.request.url}`, err);
		return new Response('Network error and no cache available', { status: 503 });
	}
}

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);

	for (const prefix of ignoredApiRoutes) {
		if (url.pathname.startsWith(prefix)) return;
	}

	for (const [prefix, cacheKey, options] of apiRoutes) {
		if (url.pathname.startsWith(prefix)) {
			event.respondWith(
				staleWhileRevalidate(event.request, cacheKey, { pathname: url.pathname, ...options }),
			);
			return;
		}
	}

	event.respondWith(defaultFetchHandler(event.request, CacheKeys.APP));
});
