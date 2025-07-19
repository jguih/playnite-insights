/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

const CACHE = `cache-${version}`;
const GAMES_CACHE = `games-data-${version}`;
const DEV_CACHE = `developers-data-${version}`;
const DASH_CACHE = `dashboard-data-${version}`;
const cacheKeysArr = [CACHE, GAMES_CACHE, DEV_CACHE, DASH_CACHE];

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
 * @param {Request} request 
 * @param {string} cacheName
 */
async function staleWhileRevalidate(request, cacheName) {
	const cache = await caches.open(cacheName);
	const cachedResponse = await cache.match(request);

	// Start revalidation in the background
	const fetchAndUpdate = fetch(request)
		.then((networkResponse) => {
			if (networkResponse.ok) {
				cache.put(request, networkResponse.clone());
			}
			return networkResponse;
		})
		.catch(() => {
			// Ignore fetch errors
		});

	// Respond with cache if available
	if (cachedResponse) {
		return cachedResponse;
	}

	// Else, wait for the network
	return fetchAndUpdate;
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
		event.respondWith(networkFirst(event.request, GAMES_CACHE));
		return;
	}

  if (url.pathname.startsWith('/api/dash')) {
		event.respondWith(networkFirst(event.request, DASH_CACHE));
		return;
	}

  if (url.pathname.startsWith('/api/developer')) {
		event.respondWith(networkFirst(event.request, DEV_CACHE));
		return;
	}

	event.respondWith(defaultFetchHandler(event.request, CACHE));
});