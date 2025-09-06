/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

const CACHE = `cache-${version}`;
const GAMES_CACHE = `games-data-${version}`;
const COMPANY_CACHE = `company-data-${version}`;
const DASH_CACHE = `dashboard-data-${version}`;
const GENRE_CACHE = `genre-data-${version}`;
const PLATFORM_CACHE = `platform-data-${version}`;
const RECENT_SESSION_CACHE = `recent-session-data-${version}`;
const ALL_SESSION_CACHE = `all-session-cache-${version}`;
const cacheKeysArr = [
	CACHE,
	GAMES_CACHE,
	COMPANY_CACHE,
	DASH_CACHE,
	GENRE_CACHE,
	PLATFORM_CACHE,
	RECENT_SESSION_CACHE,
	ALL_SESSION_CACHE
];

const ASSETS = [
	...build, // the app itself
	...files  // everything in `static`
];

self.addEventListener('install', (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
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
	const cachedETag = cachedResponse.headers.get("ETag");

	const fetchAndUpdate = fetch(request)
		.then((networkResponse) => {
			if (networkResponse.ok) {
				cache.put(request, networkResponse.clone());
			}
			const networkETag = networkResponse.headers.get("ETag");
			if (!cachedResponse || (cachedETag && networkETag && cachedETag !== networkETag)) {
				notifyClients(updateMessage);
			}
			return networkResponse;
		})
		.catch(() => {
			return cachedResponse || new Response(null, { status: 503, statusText: 'Service Unavailable' });
		});

	return cachedResponse || fetchAndUpdate;
}

/**
 * @param {Request} request 
 * @param {string} cacheName 
 * @returns 
 */
async function networkFirst(request, cacheName) {
	const cache = await caches.open(cacheName);

	try {
		const networkResponse = await fetch(request);
		if (networkResponse.ok) {
			cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch (error) {
		// Network failed, try to return from cache
		const cachedResponse = await cache.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}

		console.warn(`SW failed to fetch and found no cache for ${request.url}`, err);
		return new Response("Network error and no cache available", { status: 503 });
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
		return new Response("Network error and no cache available", { status: 503 });
	}
}


self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);

	if (url.pathname.startsWith('/api/game')) {
		event.respondWith(staleWhileRevalidate(event.request, GAMES_CACHE));
		return;
	}

	if (url.pathname.startsWith('/api/dash')) {
		event.respondWith(staleWhileRevalidate(event.request, DASH_CACHE));
		return;
	}

	if (url.pathname.startsWith('/api/company')) {
		event.respondWith(staleWhileRevalidate(event.request, COMPANY_CACHE));
		return;
	}

	if (url.pathname.startsWith('/api/genre')) {
		event.respondWith(staleWhileRevalidate(event.request, GENRE_CACHE));
		return;
	}

	if (url.pathname.startsWith('/api/platform')) {
		event.respondWith(staleWhileRevalidate(event.request, PLATFORM_CACHE));
		return;
	}

	if (url.pathname.startsWith('/api/session/recent')) {
		event.respondWith(staleWhileRevalidate(event.request, RECENT_SESSION_CACHE, { type: "RECENT_SESSION_UPDATE" }));
		return;
	}

	event.respondWith(defaultFetchHandler(event.request, CACHE));
});